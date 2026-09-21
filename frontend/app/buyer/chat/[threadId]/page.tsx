"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, ShoppingCart, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageList } from "@/components/chat/MessageList"
import { ChatInput } from "@/components/chat/ChatInput"
import { CartSheet } from "@/components/chat/CartSheet"
import { RetryPaymentBanner } from "@/components/checkout/RetryPaymentBanner"
import { useThreadMessages } from "@/hooks/useThreads"
import { useSearch } from "@/hooks/useSearch"
import { useCart, useCartMutations } from "@/hooks/useCart"
import { useFeedback } from "@/hooks/useFeedback"
import { useCheckoutStore } from "@/stores/useCheckoutStore"
import type { MessageProduct, MessageSchema } from "@/types/api"

export default function ThreadPage() {
  const params = useParams()
  const threadId = params?.threadId as string

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useThreadMessages(threadId)
  const { send, isStreaming, pendingUserMessage } = useSearch(threadId)
  const { data: cart } = useCart(threadId)
  const { add } = useCartMutations(threadId)
  const sendFeedback = useFeedback(threadId)
  const reconcileFromServer = useCheckoutStore((s) => s.reconcileFromServer)

  const [cartOpen, setCartOpen] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  // Reconcile checkout state with the server on entering a thread (spec §6).
  useEffect(() => {
    if (threadId) void reconcileFromServer(threadId)
  }, [threadId, reconcileFromServer])

  // Flatten paginated history into chronological order (oldest → newest).
  const messages: MessageSchema[] = useMemo(() => {
    if (!data) return []
    const ordered = [...data.pages].reverse()
    return ordered.flatMap((page) => page.messages)
  }, [data])

  const handleAddToCart = async (product: MessageProduct) => {
    setAddingId(product.product_id)
    try {
      await add.mutateAsync({ productId: product.product_id })
      if (!product.can_buy_here) {
        toast("Added to cart — this item is sold externally.", {
          description: "You can review it here, but you'll need to complete the purchase on the original site.",
          action: product.redirect_url
            ? {
                label: "Open site",
                onClick: () => window.open(product.redirect_url, "_blank", "noopener,noreferrer"),
              }
            : undefined,
          icon: <ExternalLink className="h-4 w-4" />,
        })
      } else {
        toast.success("Added to cart")
      }
    } finally {
      setAddingId(null)
    }
  }

  const cartCount = cart?.items.length ?? 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="truncate text-sm font-medium text-muted-foreground">Conversation</h1>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-2"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          Cart
          {cartCount > 0 && (
            <Badge className="ml-1 h-5 min-w-5 justify-center px-1.5">{cartCount}</Badge>
          )}
        </Button>
      </header>

      <RetryPaymentBanner />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MessageList
          threadId={threadId}
          messages={messages}
          hasMore={Boolean(hasNextPage)}
          isFetchingMore={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          isStreaming={isStreaming}
          pendingUserMessage={pendingUserMessage}
          onAddToCart={handleAddToCart}
          onFeedback={sendFeedback}
          addingProductId={addingId}
        />
      )}

      <ChatInput
        onSend={(value) => void send({ query: value, threadId })}
        disabled={isStreaming}
      />

      <CartSheet threadId={threadId} open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  )
}
