"use client"

import { useCallback } from "react"
import { useCheckoutStore } from "@/stores/useCheckoutStore"

export function usePayment(threadId?: string) {
  const paymentStatus = useCheckoutStore((s) => s.paymentStatus)
  const paymentLoading = useCheckoutStore((s) => s.paymentLoading)
  const checkoutActive = useCheckoutStore((s) => s.checkoutActive)
  const initiatePayment = useCheckoutStore((s) => s.initiatePayment)
  const isOrderConfirmModalOpen = useCheckoutStore((s) => s.isOrderConfirmModalOpen)
  const orderConfirmation = useCheckoutStore((s) => s.orderConfirmation)
  const closeOrderConfirmModal = useCheckoutStore((s) => s.closeOrderConfirmModal)

  // Manual user-initiated resume/retry — the only non-live initiate path allowed.
  const retryPayment = useCallback(() => {
    if (threadId) void initiatePayment(threadId)
  }, [threadId, initiatePayment])

  return {
    paymentStatus,
    paymentLoading,
    checkoutActive,
    retryPayment,
    isOrderConfirmModalOpen,
    orderConfirmation,
    closeOrderConfirmModal,
  }
}
