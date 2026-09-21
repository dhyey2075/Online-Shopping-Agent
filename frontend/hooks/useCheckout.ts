"use client"

import { useCallback } from "react"
import { useCheckoutStore } from "@/stores/useCheckoutStore"

export function useCheckout() {
  const checkoutActive = useCheckoutStore((s) => s.checkoutActive)
  const checkoutStep = useCheckoutStore((s) => s.checkoutStep)
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId)
  const selectedCartItems = useCheckoutStore((s) => s.selectedCartItems)
  const reconcileFromServer = useCheckoutStore((s) => s.reconcileFromServer)
  const syncFromSearchResponse = useCheckoutStore((s) => s.syncFromSearchResponse)
  const reset = useCheckoutStore((s) => s.reset)

  const reconcile = useCallback((threadId: string) => reconcileFromServer(threadId), [reconcileFromServer])

  return {
    checkoutActive,
    checkoutStep,
    selectedAddressId,
    selectedCartItems,
    reconcile,
    syncFromSearchResponse,
    reset,
  }
}
