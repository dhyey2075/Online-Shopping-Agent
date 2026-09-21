import { apiClient } from "./apiClient"
import type { CartResponse } from "@/types/api"

export const cartService = {
  async get(threadId: string): Promise<CartResponse> {
    const { data } = await apiClient.get<CartResponse>(`/threads/${threadId}/cart`)
    return data
  },

  async add(threadId: string, productId: string, quantity = 1): Promise<void> {
    await apiClient.post(`/threads/${threadId}/cart/add`, { product_id: productId, quantity })
  },

  async remove(threadId: string, cartItemId: string): Promise<void> {
    await apiClient.post(`/threads/${threadId}/cart/remove`, { cart_item_id: cartItemId })
  },

  async update(threadId: string, cartItemId: string, quantity: number): Promise<void> {
    await apiClient.put(`/threads/${threadId}/cart/update`, { cart_item_id: cartItemId, quantity })
  },

  async clear(threadId: string): Promise<void> {
    await apiClient.delete(`/threads/${threadId}/cart/clear`)
  },
}
