'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useSellerActiveOrders,
  useSellerOrderHistory,
  useDispatchOrder,
} from '@/hooks/useSellerOrders'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPrice, formatDate } from '@/lib/format'
import { ChevronDown, ChevronUp, Truck, ArrowRight } from 'lucide-react'
import type { SellerSubOrder } from '@/types/api'

export default function SellerOrdersPage() {
  const active = useSellerActiveOrders()
  const history = useSellerOrderHistory()
  const dispatch = useDispatchOrder()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <OrdersTable
            orders={active.data?.orders}
            isLoading={active.isLoading}
            onDispatch={(id) => dispatch.mutate(id)}
            dispatchingId={dispatch.isPending ? dispatch.variables : undefined}
            emptyMessage="No active orders right now"
          />
        </TabsContent>

        <TabsContent value="history">
          <OrdersTable
            orders={history.data?.orders}
            isLoading={history.isLoading}
            onDispatch={(id) => dispatch.mutate(id)}
            dispatchingId={dispatch.isPending ? dispatch.variables : undefined}
            emptyMessage="No past orders yet"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrdersTable({
  orders,
  isLoading,
  onDispatch,
  dispatchingId,
  emptyMessage,
}: {
  orders: SellerSubOrder[] | undefined
  isLoading: boolean
  onDispatch: (orderId: string) => void
  dispatchingId: string | undefined
  emptyMessage: string
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expanded === order.order_id
              const firstItem = order.items[0]
              const extraCount = order.items.length - 1

              return (
                <div key={order.order_id} className="rounded-lg border">
                  <div className="flex items-start justify-between gap-4 p-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/seller/orders/${order.order_id}`}
                          className="font-semibold hover:underline"
                        >
                          Order #{order.order_id.slice(-8)}
                        </Link>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_address.city}, {order.delivery_address.pincode}
                      </p>
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : order.order_id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {firstItem?.title ?? 'No items'}
                        {extraCount > 0 && ` +${extraCount} more`}
                        {order.items.length > 1 &&
                          (isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ))}
                      </button>
                      {isExpanded && (
                        <ul className="ml-1 mt-1 space-y-0.5 border-l pl-3 text-sm text-muted-foreground">
                          {order.items.map((item, i) => (
                            <li key={`${item.product_id}-${i}`}>
                              {item.title} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-semibold">
                        {formatPrice(order.total, order.currency)}
                      </p>
                      {order.status === 'PAID' && (
                        <Button
                          size="sm"
                          onClick={() => onDispatch(order.order_id)}
                          disabled={dispatchingId === order.order_id}
                        >
                          <Truck className="h-3.5 w-3.5" />
                          {dispatchingId === order.order_id ? 'Dispatching…' : 'Mark as dispatched'}
                        </Button>
                      )}
                      <Link href={`/seller/orders/${order.order_id}`}>
                        <Button variant="ghost" size="sm">
                          Details
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
