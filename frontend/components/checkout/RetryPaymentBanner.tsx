"use client"

import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCheckoutStore } from "@/stores/useCheckoutStore"

/**
 * Persistent payment-status affordance, driven purely by paymentStatus:
 * - failed/cancelled (+ checkoutActive): "Resume payment" — the only place,
 *   besides the live post-search auto-trigger, allowed to call initiatePayment.
 * - already_completed: non-interactive "Payment Completed", success-styled.
 * Never auto-opens Razorpay itself — only the button click does.
 */
export function RetryPaymentBanner() {
  const paymentStatus = useCheckoutStore((s) => s.paymentStatus)
  const paymentLoading = useCheckoutStore((s) => s.paymentLoading)
  const checkoutActive = useCheckoutStore((s) => s.checkoutActive)
  const threadId = useCheckoutStore((s) => s.threadId)
  const initiatePayment = useCheckoutStore((s) => s.initiatePayment)

  if (paymentStatus === "already_completed") {
    return (
      <div className="flex items-center gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="flex-1 font-medium">Payment Completed</span>
      </div>
    )
  }

  const isRetryable =
    checkoutActive && (paymentStatus === "failed" || paymentStatus === "cancelled")
  if (!isRetryable || !threadId) return null

  const message =
    paymentStatus === "failed"
      ? "Your payment didn't go through."
      : "Checkout was cancelled before payment completed."

  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message} You can pick up right where you left off.</span>
      <Button
        size="sm"
        variant="outline"
        className="h-7 border-amber-300 bg-transparent text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
        disabled={paymentLoading}
        onClick={() => void initiatePayment(threadId)}
      >
        {paymentLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Resume payment
      </Button>
    </div>
  )
}
