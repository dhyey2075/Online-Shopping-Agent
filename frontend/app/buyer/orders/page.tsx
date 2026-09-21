"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Loader2, Package } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { formatPrice, formatDate } from "@/lib/format"
import { useOrders } from "@/hooks/useOrders"

export default function OrdersPage() {
  const [tab, setTab] = useState<"all" | "active">("all")
  const { data: orders, isLoading } = useOrders(tab === "active")

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My orders</h1>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "active")} className="mb-5">
          <TabsList>
            <TabsTrigger value="all">All orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Package className="h-10 w-10 opacity-40" />
            <p className="text-sm">No orders yet.</p>
            <Link href="/buyer/chat" className="text-sm font-medium text-primary hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.order_id}>
                <Link href={`/buyer/orders/${order.order_id}`}>
                  <Card className="flex items-center gap-4 p-4 transition-colors hover:border-primary/40">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div
                          key={`${item.product_id}-${i}`}
                          className="relative h-12 w-12 overflow-hidden rounded-md border-2 border-card bg-muted"
                        >
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
                      ))}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          Order #{order.order_id.slice(-8)}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""} ·{" "}
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatPrice(order.total, order.currency)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
