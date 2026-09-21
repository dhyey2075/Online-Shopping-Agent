'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useSellerOrders, useDispatchOrder } from '@/hooks/useSellerOrders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPrice, formatDateTime } from '@/lib/format'
import Link from 'next/link'
import { ArrowLeft, Truck } from 'lucide-react'

export default function SellerOrderDetailPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const { orders, isLoading } = useSellerOrders()
  const dispatch = useDispatchOrder()

  const order = orders.find((o) => o.order_id === orderId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Order not found</p>
        <Link href="/seller/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    )
  }

  const canDispatch = order.status === 'PAID'
  const subtotal = order.items.reduce((sum, item) => sum + item.price.value * item.quantity, 0)

  return (
    <div className="space-y-6">
      <Link href="/seller/orders">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Order #{order.order_id.slice(-8)}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed {formatDateTime(order.created_at)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <OrderStatusBadge status={order.status} />
              {canDispatch && (
                <Button
                  size="sm"
                  onClick={() => dispatch.mutate(order.order_id)}
                  disabled={dispatch.isPending}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {dispatch.isPending ? 'Dispatching...' : 'Mark as dispatched'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{order.delivery_address.line1}</p>
            {order.delivery_address.line2 ? <p>{order.delivery_address.line2}</p> : null}
            <p>
              {order.delivery_address.city}, {order.delivery_address.state}{' '}
              {order.delivery_address.pincode}
            </p>
            <p>{order.delivery_address.country}</p>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
              <span>{formatPrice(subtotal, order.currency)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(order.total, order.currency)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={`${item.product_id}-${idx}`} className="flex items-center gap-3 py-3 border-b last:border-0">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.price.value, item.price.currency)}</p>
                  <p className="text-sm text-muted-foreground">
                    Subtotal: {formatPrice(item.price.value * item.quantity, item.price.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
