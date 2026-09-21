import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/api"

const CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: "Pending payment",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  PAID: { label: "Paid", className: "bg-sky-100 text-sky-800 border-sky-200" },
  DISPATCHED: {
    label: "Dispatched",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-primary/15 text-primary border-primary/20",
  },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = CONFIG[status] ?? CONFIG.PENDING_PAYMENT
  return (
    <Badge variant="outline" className={cn("font-medium", cfg.className)}>
      {cfg.label}
    </Badge>
  )
}
