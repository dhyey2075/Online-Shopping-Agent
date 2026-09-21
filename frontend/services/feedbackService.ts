import { apiClient } from "./apiClient"
import type { FeedbackAction } from "@/types/api"

export const feedbackService = {
  async send(threadId: string, productId: string, action: FeedbackAction): Promise<void> {
    try {
      await apiClient.post("/feedback", { thread_id: threadId, product_id: productId, action })
    } catch {
      // Feedback is a fire-and-forget relevance signal; never surface errors.
    }
  },
}
