"use client"

import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/format"
import type { ExternalItem } from "@/types/api"

interface ExternalItemCardProps {
  item: ExternalItem
  onFeedback: (productId: string, action: "click" | "like" | "ignore") => void
}

export function ExternalItemCard({ item, onFeedback }: ExternalItemCardProps) {
  const handleClick = () => {
    onFeedback(item.product_id, "click")
    window.open(item.redirect_url, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick()
      }}
      className="flex w-60 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-dashed border-border bg-muted/30"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {item.image ? (
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.title}
            fill
            sizes="240px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <Badge variant="outline" className="absolute left-2 top-2 bg-background/90 text-[10px]">
          External · {item.source}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</h4>
        <span className="text-base font-semibold">
          {formatPrice(item.price.value, item.price.currency)}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="mt-auto h-8 w-full text-xs"
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Buy on {item.source}
        </Button>
      </div>
    </div>
  )
}
