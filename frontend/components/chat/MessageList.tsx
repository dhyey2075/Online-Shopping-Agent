"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { Bot, Loader2 } from "lucide-react"
import { MessageBubble } from "./MessageBubble"
import { useCheckoutStore } from "@/stores/useCheckoutStore"
import type { MessageProduct, MessageSchema } from "@/types/api"
import type { OutcomeBubble } from "@/stores/useCheckoutStore"

// Stable reference so the zustand selector below never returns a "new" array
// when a thread has no bubbles yet — returning a fresh `[]` literal on every
// call breaks useSyncExternalStore's snapshot-caching contract and causes an
// infinite render loop ("The result of getSnapshot should be cached").
const EMPTY_OUTCOME_BUBBLES: OutcomeBubble[] = []

interface MessageListProps {
  threadId: string
  messages: MessageSchema[]
  hasMore: boolean
  isFetchingMore: boolean
  onLoadMore: () => void
  isStreaming: boolean
  pendingUserMessage: string | null
  onAddToCart: (product: MessageProduct) => void
  onFeedback: (productId: string, action: "click" | "like" | "ignore") => void
  addingProductId?: string | null
}

export function MessageList({
  threadId,
  messages,
  hasMore,
  isFetchingMore,
  onLoadMore,
  isStreaming,
  pendingUserMessage,
  onAddToCart,
  onFeedback,
  addingProductId,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // Callback ref (rather than reading scrollRef.current directly) so this
  // triggers a re-render as soon as the scroll container mounts — otherwise
  // useInView's `root` would still be null on the very first render.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const outcomeBubbles = useCheckoutStore((s) => s.outcomeBubbles[threadId] ?? EMPTY_OUTCOME_BUBBLES)

  const visibleMessages = useMemo(
    () => messages.filter((m) => m.role === "user" || m.role === "assistant"),
    [messages],
  )

  // Fires when the sentinel at the top of the list scrolls into view — this
  // replaces the manual "Load earlier messages" button with silent,
  // automatic pagination.
  const { ref: loadMoreRef, inView } = useInView({
    root: scrollEl,
    rootMargin: "200px 0px 0px 0px",
    skip: !hasMore,
  })

  useEffect(() => {
    if (inView && hasMore && !isFetchingMore) {
      onLoadMore()
    }
  }, [inView, hasMore, isFetchingMore, onLoadMore])

  // Loading older messages prepends content above the current scroll
  // position, which would otherwise yank the view down by the height of the
  // newly-inserted content. Capture the scroll height before the fetch and
  // restore the user's relative position once it lands.
  const prevScrollHeightRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (isFetchingMore) {
      prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? null
    }
  }, [isFetchingMore])

  useLayoutEffect(() => {
    const container = scrollRef.current
    const prevHeight = prevScrollHeightRef.current
    if (!isFetchingMore && container && prevHeight != null) {
      container.scrollTop += container.scrollHeight - prevHeight
      prevScrollHeightRef.current = null
    }
  }, [isFetchingMore, visibleMessages.length])

  // Stable callback ref (not recreated every render) — an inline arrow
  // function here would be a new reference each render, causing React to
  // detach/reattach it (and call setScrollEl) on every single render.
  const setScrollContainer = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node
    setScrollEl(node)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [visibleMessages.length, isStreaming, outcomeBubbles.length])

  return (
    <div ref={setScrollContainer} className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-2">
            {isFetchingMore && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        )}

        {visibleMessages.map((message, idx) => (
          <MessageBubble
            key={`${message.role}-${idx}`}
            message={message}
            threadId={threadId}
            onAddToCart={onAddToCart}
            onFeedback={onFeedback}
            addingProductId={addingProductId}
          />
        ))}

        {pendingUserMessage && (
          <MessageBubble
            message={{
              role: "user",
              content: pendingUserMessage,
              products: [],
              external_items: [],
              has_external: false,
            }}
            threadId={threadId}
            onAddToCart={onAddToCart}
            onFeedback={onFeedback}
          />
        )}

        {isStreaming && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
            </div>
          </div>
        )}

        {outcomeBubbles.map((bubble) => (
          <div key={bubble.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-accent px-4 py-2.5 text-sm leading-relaxed text-accent-foreground">
              {bubble.content}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
