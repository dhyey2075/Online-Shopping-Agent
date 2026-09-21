"use client"

import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { searchService } from "@/services/searchService"
import { extractApiError, getApiStatus } from "@/services/apiClient"
import { useCheckoutStore } from "@/stores/useCheckoutStore"
import type { MessageSchema, SearchResponse, ThreadDetailResponse } from "@/types/api"

interface SendArgs {
  query: string
  threadId?: string
}

/**
 * Drives the /search request. Handles optimistic user bubble, thread cache
 * append, checkout sync, and (for brand-new threads) navigation.
 */
export function useSearch(activeThreadId?: string) {
  const qc = useQueryClient()
  const router = useRouter()
  const syncFromSearchResponse = useCheckoutStore((s) => s.syncFromSearchResponse)
  const [isStreaming, setIsStreaming] = useState(false)
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)

  const appendToThreadCache = useCallback(
    (threadId: string, message: MessageSchema) => {
      qc.setQueryData<{ pages: ThreadDetailResponse[]; pageParams: unknown[] }>(
        ["thread", threadId],
        (old) => {
          if (!old) return old
          const pages = [...old.pages]
          const last = pages[pages.length - 1]
          if (!last) return old
          pages[pages.length - 1] = { ...last, messages: [...last.messages, message] }
          return { ...old, pages }
        },
      )
    },
    [qc],
  )

  const send = useCallback(
    async ({ query, threadId }: SendArgs) => {
      const trimmed = query.trim()
      if (!trimmed) return
      setIsStreaming(true)
      // The in-flight user bubble is shown via pendingUserMessage (the list
      // renders it). We only commit it to the cache once the request succeeds.
      setPendingUserMessage(trimmed)

      try {
        const res: SearchResponse = await searchService.search({ query: trimmed, thread_id: threadId })

        const userMessage: MessageSchema = {
          role: "user",
          content: trimmed,
          products: [],
          external_items: [],
          has_external: false,
        }
        const assistantMessage: MessageSchema = {
          role: "assistant",
          content: res.content,
          products: res.products,
          external_items: res.external_items,
          has_external: res.has_external,
        }

        // New thread → refresh list and navigate into it (the thread page will
        // load the freshly-created history from the server).
        if (!threadId) {
          await qc.invalidateQueries({ queryKey: ["threads"] })
          syncFromSearchResponse(res.thread_id, res.checkout)
          router.replace(`/buyer/chat/${res.thread_id}`)
        } else {
          appendToThreadCache(res.thread_id, userMessage)
          appendToThreadCache(res.thread_id, assistantMessage)
          qc.invalidateQueries({ queryKey: ["threads"] })
          qc.invalidateQueries({ queryKey: ["cart", res.thread_id] })
          syncFromSearchResponse(res.thread_id, res.checkout)
        }
        return res
      } catch (err) {
        if (getApiStatus(err) === 429) {
          toast.error("You're sending messages quickly — please wait a moment.")
        } else {
          toast.error(extractApiError(err, "Something went wrong. Please try again."))
        }
        throw err
      } finally {
        setIsStreaming(false)
        setPendingUserMessage(null)
      }
    },
    [appendToThreadCache, qc, router, syncFromSearchResponse],
  )

  return { send, isStreaming, pendingUserMessage }
}
