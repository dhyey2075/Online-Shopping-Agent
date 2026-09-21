"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink, Plus, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import type { MessageProduct } from "@/types/api"

interface ProductCardProps {
  product: MessageProduct
  threadId: string
  onAddToCart: (product: MessageProduct) => void
  onFeedback: (productId: string, action: "click" | "like" | "ignore") => void
  isAdding?: boolean
}

export function ProductCard({ product, onAddToCart, onFeedback, isAdding }: ProductCardProps) {
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleRedirect = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFeedback(product.product_id, "click")
    window.open(product.redirect_url || product.url, "_blank", "noopener,noreferrer")
  }

  // Clicking the card body (anywhere but the action buttons) fires the
  // "click" feedback signal and opens the product's link, per spec §3.3.
  const handleCardClick = () => {
    onFeedback(product.product_id, "click")
    const href = product.url || product.redirect_url
    if (href) window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleCardClick()
      }}
      className="group flex w-60 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            fill
            sizes="240px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute left-2 top-2 bg-background/90 text-[10px] uppercase tracking-wide backdrop-blur"
        >
          {product.source}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
          {product.title}
        </h4>

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-foreground">
            {formatPrice(product.price.value, product.price.currency)}
          </span>
          {product.rating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        {product.short_reason && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.short_reason}
          </p>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          {product.cart_supported && product.can_buy_here ? (
            <Button
              size="sm"
              className="h-8 flex-1 text-xs"
              onClick={handleAdd}
              disabled={isAdding}
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Added
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Add
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className={cn("h-8 flex-1 text-xs")}
              onClick={handleRedirect}
            >
              <ExternalLink className="h-3.5 w-3.5" /> View
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
