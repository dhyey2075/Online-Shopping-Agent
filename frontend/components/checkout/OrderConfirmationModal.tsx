"use client"

import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { useCheckoutStore } from "@/stores/useCheckoutStore"

export function OrderConfirmationModal() {
  const router = useRouter()
  const open = useCheckoutStore((s) => s.isOrderConfirmModalOpen)
  const confirmation = useCheckoutStore((s) => s.orderConfirmation)
  const close = useCheckoutStore((s) => s.closeOrderConfirmModal)

  if (!confirmation) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center">Order confirmed</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
          <Row label="Order ID" value={confirmation.order_id} />
          <Row label="Items" value={String(confirmation.items_count)} />
          <Row
            label="Total paid"
            value={formatPrice(confirmation.total, confirmation.currency)}
            emphasize
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            onClick={() => {
              close()
              router.push("/buyer/orders")
            }}
          >
            View my orders
          </Button>
          <Button variant="ghost" className="w-full" onClick={close}>
            Continue shopping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? "font-semibold text-foreground" : "font-medium"}>{value}</span>
    </div>
  )
}
