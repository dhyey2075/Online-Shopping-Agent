"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ExternalLink, Loader2, MapPin, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/format"
import { useCart, useCartMutations } from "@/hooks/useCart"
import { useAddresses } from "@/hooks/useAddresses"
import { useCheckoutStore } from "@/stores/useCheckoutStore"
import { AddressPickerModal } from "@/components/address/AddressPickerModal"
import type { AddressResponse } from "@/types/api"

interface CartSheetProps {
  threadId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ threadId, open, onOpenChange }: CartSheetProps) {
  const { data: cart, isLoading } = useCart(threadId)
  const { remove, update } = useCartMutations(threadId)
  const { addresses, defaultAddressId } = useAddresses()

  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId)
  const setSelectedAddress = useCheckoutStore((s) => s.setSelectedAddress)
  const initiatePayment = useCheckoutStore((s) => s.initiatePayment)
  const paymentLoading = useCheckoutStore((s) => s.paymentLoading)

  const [pickerOpen, setPickerOpen] = useState(false)

  // Default the address selection to the user's default once available.
  useEffect(() => {
    if (!selectedAddressId && defaultAddressId) {
      setSelectedAddress(threadId, defaultAddressId)
    }
  }, [selectedAddressId, defaultAddressId, setSelectedAddress, threadId])

  const selectedAddress: AddressResponse | undefined = addresses.find(
    (a) => a.id === selectedAddressId,
  )

  const purchasable = cart?.items.filter((i) => i.can_buy_here) ?? []
  const external = cart?.items.filter((i) => !i.can_buy_here) ?? []
  const canPay = purchasable.length > 0 && Boolean(selectedAddressId) && !paymentLoading

  const handlePay = async () => {
    if (!selectedAddressId) {
      setPickerOpen(true)
      return
    }
    await initiatePayment(threadId)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" /> Your cart
            {cart && cart.items.length > 0 && (
              <Badge variant="secondary">{cart.items.length}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <ShoppingBag className="h-10 w-10 opacity-40" />
              <p className="text-sm">Your cart is empty.</p>
              <p className="text-xs">Ask the assistant to find products for you.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {purchasable.length > 0 && (
                <div className="space-y-3">
                  {purchasable.map((item) => (
                    <div key={item.cart_item_id} className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.image && (
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>
                        <span className="text-sm font-semibold">
                          {formatPrice(item.price.value, item.price.currency)}
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center rounded-md border border-border">
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                              disabled={item.quantity <= 1 || update.isPending}
                              onClick={() =>
                                update.mutate({ cartItemId: item.cart_item_id, quantity: item.quantity - 1 })
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                              disabled={update.isPending}
                              onClick={() =>
                                update.mutate({ cartItemId: item.cart_item_id, quantity: item.quantity + 1 })
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => remove.mutate(item.cart_item_id)}
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {external.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Buy on external sites
                  </p>
                  {external.map((item) => (
                    <div key={item.cart_item_id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {item.image && (
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <p className="line-clamp-2 flex-1 text-xs leading-snug">{item.title}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => window.open(item.redirect_url, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {cart && purchasable.length > 0 && (
          <div className="space-y-3 border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full items-start gap-2 rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted/50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 leading-relaxed">
                {selectedAddress ? (
                  <>
                    {selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state}{" "}
                    {selectedAddress.pincode}
                  </>
                ) : (
                  "Select a delivery address"
                )}
              </span>
              <span className="text-xs text-primary">Change</span>
            </button>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated total</span>
              <span className="text-lg font-semibold">
                {formatPrice(cart.estimated_total, cart.currency)}
              </span>
            </div>

            <Button className="w-full" size="lg" disabled={!canPay} onClick={handlePay}>
              {paymentLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Starting payment...
                </>
              ) : (
                `Pay ${formatPrice(cart.estimated_total, cart.currency)}`
              )}
            </Button>
          </div>
        )}
      </SheetContent>

      <AddressPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedId={selectedAddressId}
        onSelect={(addr) => {
          setSelectedAddress(threadId, addr.id)
          setPickerOpen(false)
        }}
      />
    </Sheet>
  )
}
