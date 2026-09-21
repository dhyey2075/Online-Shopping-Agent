import { apiClient } from "./apiClient"
import type { BuyerOrderDetail, BuyerOrderListItem } from "@/types/api"

export const orderService = {
  async list(activeOnly = false): Promise<BuyerOrderListItem[]> {
    const { data } = await apiClient.get<BuyerOrderListItem[]>("/orders", {
      params: { active_only: activeOnly },
    })
    return data
  },

  async detail(orderId: string): Promise<BuyerOrderDetail> {
    const { data } = await apiClient.get<BuyerOrderDetail>(`/orders/${orderId}`)
    return data
  },
}
