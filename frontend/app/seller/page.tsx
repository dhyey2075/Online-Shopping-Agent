'use client'

import Link from 'next/link'
import { Package, ShoppingCart, Truck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPrice, formatDate } from '@/lib/format'
import { useSellerDashboard, useSellerProducts } from '@/hooks/useSellerProducts'
import { useSellerOrders } from '@/hooks/useSellerOrders'

export default function SellerDashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useSellerDashboard()
  const { orders, isLoading: ordersLoading } = useSellerOrders()
  const { data: products, isLoading: productsLoading } = useSellerProducts()

  const recentOrders = [...orders]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your seller hub</p>
      </div>

      {/* Stats Grid — 3-up per spec §4.1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {summary?.total_products ?? 0}
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                  ({summary?.active_products ?? 0} active)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.active_orders ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dispatches</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{summary?.pending_dispatches ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest customer orders</CardDescription>
            </div>
            <Link href="/seller/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link key={order.order_id} href={`/seller/orders/${order.order_id}`}>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition">
                    <div>
                      <p className="font-medium">Order #{order.order_id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length === 1 ? '' : 's'} ·{' '}
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total, order.currency)}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">No orders yet</p>
          )}
        </CardContent>
      </Card>

      {/* Products Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </div>
            <Link href="/seller/products">
              <Button variant="outline" size="sm">
                Manage Products
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.slice(0, 4).map((product) => (
                <div key={product.product_id} className="p-4 border rounded-lg hover:bg-accent transition">
                  <p className="font-medium line-clamp-1">{product.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-semibold">{formatPrice(product.price, product.currency)}</span>
                    <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products yet</p>
              <Link href="/seller/products">
                <Button variant="outline" className="mt-4">
                  Add Your First Product
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
