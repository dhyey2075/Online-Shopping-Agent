import { create } from "zustand"
import { toast } from "sonner"
import type {
  CheckoutStateSchema,
  CheckoutStep,
  NotifyEvent,
  OrderConfirmationResponse,
  RazorpayResponse,
} from "@/types/api"
import { checkoutService } from "@/services/checkoutService"
import { openRazorpayWidget } from "@/services/paymentService"
import { extractApiError } from "@/services/apiClient"
import { getQueryClient } from "@/lib/queryClient"

export type PaymentStatus =
  | "idle"
  | "creating_order"
  | "widget_open"
  | "confirming"
  | "success"
  | "failed"
  | "cancelled"
  | "already_completed"

export interface OutcomeBubble {
  id: string
  content: string
}

const SUCCESS_COPY = (orderId: string) =>
  `🎉 Payment successful! Your order ${orderId} has been placed.`
const FAILED_COPY = "❌ Payment failed. Please try again."
const CANCELLED_COPY = "⚠️ Payment was cancelled. You can resume checkout whenever you're ready."

interface CheckoutState {
  threadId: string | null
  checkoutActive: boolean
  checkoutStep: CheckoutStep | null
  selectedAddressId: string | null
  selectedCartItems: string[]
  currentOrderId: string | null
  razorpayOrderId: string | null
  paymentStatus: PaymentStatus
  paymentLoading: boolean
  notifiedEvents: Set<string>
  confirmedForOrderId: string | null

  // confirmation modal
  orderConfirmation: OrderConfirmationResponse | null
  isOrderConfirmModalOpen: boolean

  // optimistic, local-only chat bubbles keyed by thread
  outcomeBubbles: Record<string, OutcomeBubble[]>

  // actions
  setSelectedAddress: (threadId: string, addressId: string) => void
  syncFromSearchResponse: (threadId: string, checkout: CheckoutStateSchema | null) => void
  reconcileFromServer: (threadId: string) => Promise<void>
  initiatePayment: (threadId: string) => Promise<void>
  handleRazorpaySuccess: (threadId: string, resp: RazorpayResponse) => Promise<void>
  handleRazorpayFailure: (threadId: string) => Promise<void>
  handleRazorpayDismiss: (threadId: string) => Promise<void>
  closeOrderConfirmModal: () => void
  reset: () => void
}

function applyServerCheckout(state: CheckoutStateSchema) {
  return {
    checkoutActive: state.active,
    checkoutStep: state.step,
    selectedAddressId: state.selected_address_id,
    selectedCartItems: state.selected_cart_items ?? [],
    currentOrderId: state.current_order_id,
    razorpayOrderId: state.razorpay_order_id,
  }
}

export const useCheckoutStore = create<CheckoutState>((set, get) => {
  function invalidateAfterPayment(threadId: string) {
    const qc = getQueryClient()
    qc.invalidateQueries({ queryKey: ["cart", threadId] })
    qc.invalidateQueries({ queryKey: ["threads"] })
    qc.invalidateQueries({ queryKey: ["thread", threadId] })
    qc.invalidateQueries({ queryKey: ["orders"] })
  }

  function appendBubble(threadId: string, content: string) {
    set((s) => {
      const existing = s.outcomeBubbles[threadId] ?? []
      return {
        outcomeBubbles: {
          ...s.outcomeBubbles,
          [threadId]: [...existing, { id: `${Date.now()}-${Math.random()}`, content }],
        },
      }
    })
  }

  // step 6: optimistic bubble + (deduped) notify call.
  function notifyAndBubble(threadId: string, event: NotifyEvent, orderId: string | undefined, content: string) {
    const key = `${orderId ?? "_"}:${event}`
    const { notifiedEvents } = get()
    if (notifiedEvents.has(key)) return
    const next = new Set(notifiedEvents)
    next.add(key)
    set({ notifiedEvents: next })

    appendBubble(threadId, content)

    // fire-and-forget — never block UI on this
    checkoutService
      .notifyOrderEvent({ thread_id: threadId, event, order_id: orderId })
      .catch(() => {})
  }

  return {
    threadId: null,
    checkoutActive: false,
    checkoutStep: null,
    selectedAddressId: null,
    selectedCartItems: [],
    currentOrderId: null,
    razorpayOrderId: null,
    paymentStatus: "idle",
    paymentLoading: false,
    notifiedEvents: new Set<string>(),
    confirmedForOrderId: null,
    orderConfirmation: null,
    isOrderConfirmModalOpen: false,
    outcomeBubbles: {},

    setSelectedAddress: (threadId, addressId) =>
      set({ threadId, selectedAddressId: addressId }),

    syncFromSearchResponse: (threadId, checkout) => {
      if (!checkout) {
        set({ threadId, checkoutActive: false, checkoutStep: null })
        return
      }
      set({ threadId, ...applyServerCheckout(checkout) })

      const { paymentStatus } = get()
      const canFire =
        paymentStatus === "idle" || paymentStatus === "failed" || paymentStatus === "cancelled"
      if (checkout.active && checkout.step === "payment_required" && canFire) {
        // the ONLY auto-open trigger
        void get().initiatePayment(threadId)
      }
    },

    reconcileFromServer: async (threadId) => {
      try {
        const state = await checkoutService.getThreadCheckoutState(threadId)
        set({ threadId, ...applyServerCheckout(state) })

        if (state.step === "done") {
          set({ paymentStatus: "already_completed", checkoutActive: false })
        } else if (state.step === "payment_required" || state.step === "payment_created") {
          // genuinely pending — show a manual "Resume payment" affordance.
          // NEVER auto-open Razorpay here.
          set({ paymentStatus: "failed", checkoutActive: true })
        } else {
          set({ paymentStatus: "idle" })
        }
      } catch {
        // reconciliation is best-effort; leave state as-is
      }
    },

    initiatePayment: async (threadId) => {
      const { selectedAddressId } = get()
      if (!selectedAddressId) {
        toast.error("Select a delivery address before paying.")
        return
      }
      set({ paymentLoading: true, paymentStatus: "creating_order", threadId })
      try {
        const init = await checkoutService.createPayment({
          thread_id: threadId,
          address_id: selectedAddressId,
        })
        set({
          currentOrderId: init.order_id,
          razorpayOrderId: init.razorpay_order_id,
          paymentStatus: "widget_open",
        })
        await openRazorpayWidget({
          init,
          onSuccess: (resp) => void get().handleRazorpaySuccess(threadId, resp),
          onFailure: () => void get().handleRazorpayFailure(threadId),
          onDismiss: () => void get().handleRazorpayDismiss(threadId),
        })
      } catch (err) {
        set({ paymentStatus: "failed", checkoutActive: true })
        toast.error(extractApiError(err, "Could not start payment. Please try again."))
      } finally {
        set({ paymentLoading: false })
      }
    },

    handleRazorpaySuccess: async (threadId, resp) => {
      const { confirmedForOrderId, currentOrderId } = get()
      if (confirmedForOrderId && confirmedForOrderId === currentOrderId) return
      set({ paymentStatus: "confirming" })
      try {
        const confirmation = await checkoutService.confirmPayment({
          thread_id: threadId,
          razorpay_payment_id: resp.razorpay_payment_id,
          razorpay_order_id: resp.razorpay_order_id,
          razorpay_signature: resp.razorpay_signature,
        })
        set({
          confirmedForOrderId: currentOrderId,
          paymentStatus: "success",
          checkoutActive: false,
          checkoutStep: "done",
          orderConfirmation: confirmation,
          isOrderConfirmModalOpen: true,
        })
        invalidateAfterPayment(threadId)
        notifyAndBubble(threadId, "payment_success", confirmation.order_id, confirmation.message)
      } catch (err) {
        set({ confirmedForOrderId: currentOrderId, paymentStatus: "failed", checkoutActive: true })
        toast.error(extractApiError(err, "Payment verification failed."))
        notifyAndBubble(threadId, "payment_failed", currentOrderId ?? undefined, FAILED_COPY)
      }
    },

    handleRazorpayFailure: async (threadId) => {
      const { currentOrderId } = get()
      set({ paymentStatus: "failed", checkoutActive: true })
      notifyAndBubble(threadId, "payment_failed", currentOrderId ?? undefined, FAILED_COPY)
    },

    handleRazorpayDismiss: async (threadId) => {
      const { currentOrderId, paymentStatus } = get()
      // ignore dismiss if we already succeeded/confirming
      if (paymentStatus === "success" || paymentStatus === "confirming") return
      set({ paymentStatus: "cancelled", checkoutActive: true })
      notifyAndBubble(threadId, "payment_cancelled", currentOrderId ?? undefined, CANCELLED_COPY)
    },

    closeOrderConfirmModal: () => set({ isOrderConfirmModalOpen: false }),

    reset: () =>
      set({
        threadId: null,
        checkoutActive: false,
        checkoutStep: null,
        selectedAddressId: null,
        selectedCartItems: [],
        currentOrderId: null,
        razorpayOrderId: null,
        paymentStatus: "idle",
        paymentLoading: false,
        notifiedEvents: new Set<string>(),
        confirmedForOrderId: null,
        orderConfirmation: null,
        isOrderConfirmModalOpen: false,
      }),
  }
})

export const checkoutCopy = { SUCCESS_COPY, FAILED_COPY, CANCELLED_COPY }
