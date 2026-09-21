"use client"

import { useCallback } from "react"
import { feedbackService } from "@/services/feedbackService"
import type { FeedbackAction } from "@/types/api"

/** Fire-and-forget product feedback signals. Never blocks the UI. */
export function useFeedback(threadId: string | undefined) {
  return useCallback(
    (productId: string, action: FeedbackAction) => {
      if (!threadId) return
      feedbackService.send(threadId, productId, action).catch(() => {})
    },
    [threadId],
  )
}
