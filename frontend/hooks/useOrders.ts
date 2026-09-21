"use client"

import { useQuery } from "@tanstack/react-query"
import { orderService } from "@/services/orderService"

export function useOrders(activeOnly = false) {
  return useQuery({
    queryKey: ["orders", { activeOnly }],
    queryFn: () => orderService.list(activeOnly),
  })
}

export function useOrderDetail(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", orderId],
    enabled: Boolean(orderId),
    queryFn: () => orderService.detail(orderId as string),
  })
}
