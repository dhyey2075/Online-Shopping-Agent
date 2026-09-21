"use client"

import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductCard } from "./ProductCard"
import { ExternalItemCard } from "./ExternalItemCard"
import type { MessageProduct, MessageSchema } from "@/types/api"

interface MessageBubbleProps {
  message: MessageSchema
  threadId: string
  onAddToCart: (product: MessageProduct) => void
  onFeedback: (productId: string, action: "click" | "like" | "ignore") => void
  addingProductId?: string | null
}

export function MessageBubble({
  message,
  threadId,
  onAddToCart,
  onFeedback,
  addingProductId,
}: MessageBubbleProps) {
  // Tool/system messages are internal — never render them.
  if (message.role === "tool" || message.role === "system") return null

  const isUser = message.role === "user"
  const hasProducts = message.products.length > 0
  const hasExternal = message.external_items.length > 0

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={cn("flex max-w-[85%] flex-col gap-3", isUser && "items-end")}>
        {message.content && (
          <div
            className={cn(
              "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isUser
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-muted text-foreground",
            )}
          >
            {message.content}
          </div>
        )}

        {(hasProducts || hasExternal) && (
          <div className="flex w-full max-w-[calc(100vw-6rem)] gap-3 overflow-x-auto pb-2 md:max-w-[640px]">
            {message.products.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                threadId={threadId}
                onAddToCart={onAddToCart}
                onFeedback={onFeedback}
                isAdding={addingProductId === product.product_id}
              />
            ))}
            {message.external_items.map((item) => (
              <ExternalItemCard key={item.cart_item_id} item={item} onFeedback={onFeedback} />
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
