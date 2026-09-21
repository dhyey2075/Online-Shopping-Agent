import { apiClient } from "./apiClient"
import type {
  CheckoutStateSchema,
  ThreadDetailResponse,
  ThreadSummaryResponse,
} from "@/types/api"

export const threadService = {
  async list(): Promise<ThreadSummaryResponse[]> {
    const { data } = await apiClient.get<ThreadSummaryResponse[]>("/threads")
    return data
  },

  async detail(threadId: string, params?: { limit?: number; before?: string }): Promise<ThreadDetailResponse> {
    const { data } = await apiClient.get<ThreadDetailResponse>(`/threads/${threadId}`, {
      params: { limit: params?.limit ?? 30, before: params?.before },
    })
    return data
  },

  async checkoutState(threadId: string): Promise<CheckoutStateSchema> {
    const { data } = await apiClient.get<CheckoutStateSchema>(`/threads/${threadId}/checkout`)
    return data
  },

  async rename(threadId: string, title: string): Promise<void> {
    await apiClient.put(`/threads/${threadId}`, { title })
  },

  async remove(threadId: string): Promise<void> {
    await apiClient.delete(`/threads/${threadId}`)
  },
}
