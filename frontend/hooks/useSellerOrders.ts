"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { sellerService } from "@/services/sellerService"
import { extractApiError } from "@/services/apiClient"

export function useSellerProfile() {
  return useQuery({
    queryKey: ["seller", "profile"],
    queryFn: () => sellerService.profile(),
  })
}

export function useSellerProfileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { shop_name?: string; description?: string }) =>
      sellerService.updateProfile(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller", "profile"] })
      toast.success("Shop profile updated")
    },
    onError: (err) => toast.error(extractApiError(err, "Could not update shop profile")),
  })
}

export function useSellerActiveOrders() {
  return useQuery({
    queryKey: ["seller", "orders", "active"],
    queryFn: () => sellerService.orders(),
  })
}

export function useSellerOrderHistory() {
  return useQuery({
    queryKey: ["seller", "orders", "history"],
    queryFn: () => sellerService.ordersHistory(),
  })
}

export function useSellerOrders() {
  const active = useSellerActiveOrders()
  const history = useSellerOrderHistory()

  // /seller/orders/history returns ALL statuses (active_only=False), so it's
  // already a superset of /seller/orders (active_only=True) — use history as
  // the canonical full list rather than concatenating (which would duplicate
  // every active order). Fall back to active-only data while history loads.
  const isLoading = history.isLoading
  const orders = history.data?.orders ?? active.data?.orders ?? []

  return { orders, isLoading, data: orders }
}

export function useDispatchOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => sellerService.dispatch(orderId),
    onSuccess: () => {
      toast.success("Order marked as dispatched")
      qc.invalidateQueries({ queryKey: ["seller", "orders"] })
      qc.invalidateQueries({ queryKey: ["seller", "dashboard"] })
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Could not dispatch — refreshing"))
      qc.invalidateQueries({ queryKey: ["seller", "orders"] })
    },
  })
}
