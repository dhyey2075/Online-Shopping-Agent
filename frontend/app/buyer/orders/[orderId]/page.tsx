"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Package } from "lucide-react"
import { useOrderDetail } from "@/hooks/useOrders"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice, formatDateTime } from "@/lib/format"

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const { data: order, isLoading } = useOrderDetail(orderId)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        render={
          <Link href="/buyer/orders">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to orders
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : !order ? (
        <p className="text-muted-foreground">Order not found.</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Order #{order.order_id.slice(-8)}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placed {formatDateTime(order.created_at)}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" />
                Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item, i) => (
                <div key={`${item.product_id}-${i}`} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price.value * item.quantity, item.price.currency)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              <p>{order.delivery_address.line1}</p>
              {order.delivery_address.line2 ? <p>{order.delivery_address.line2}</p> : null}
              <p>
                {order.delivery_address.city}, {order.delivery_address.state}{" "}
                {order.delivery_address.pincode}
              </p>
              <p>{order.delivery_address.country}</p>
            </CardContent>
          </Card>

          {order.seller_sub_orders?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fulfillment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.seller_sub_orders.map((sub, i) => (
                  <div key={`${sub.order_id}-${i}`}>
                    {i > 0 && <Separator className="mb-3" />}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {sub.items.length} item{sub.items.length === 1 ? "" : "s"}
                      </span>
                      <OrderStatusBadge status={sub.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
