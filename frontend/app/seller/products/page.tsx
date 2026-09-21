'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSellerProducts, useSellerProductMutations } from '@/hooks/useSellerProducts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ProductForm } from '@/components/seller/ProductForm'
import { formatPrice } from '@/lib/format'
import { cn, deriveSellerDocId } from '@/lib/utils'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import type { LocalProductResponse } from '@/types/api'
import type { ProductValues } from '@/lib/schemas'

export default function SellerProductsPage() {
  const { data: products, isLoading } = useSellerProducts()
  const { create, update, remove } = useSellerProductMutations()
  const [searchTerm, setSearchTerm] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<LocalProductResponse | null>(null)

  const filteredProducts = products?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreate = async (values: ProductValues) => {
    await create.mutateAsync(values)
    setOpenForm(false)
  }

  const handleUpdate = async (values: ProductValues) => {
    if (!editing) return
    await update.mutateAsync({ docId: deriveSellerDocId(editing.product_id), body: values })
    setEditing(null)
  }

  const handleDelete = async (productId: string) => {
    await remove.mutateAsync(deriveSellerDocId(productId))
  }

  const handleReactivate = async (productId: string) => {
    await update.mutateAsync({ docId: deriveSellerDocId(productId), body: { is_active: true } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            }
          />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Enter product details</DialogDescription>
            </DialogHeader>
            <ProductForm onSubmit={handleCreate} isSubmitting={create.isPending} submitLabel="Add product" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details</DialogDescription>
          </DialogHeader>
          {editing && (
            <ProductForm
              initial={editing}
              onSubmit={handleUpdate}
              isSubmitting={update.isPending}
              submitLabel="Save changes"
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div>
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium w-16"></th>
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Stock</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.product_id}
                      className={cn(
                        'border-b hover:bg-muted/50',
                        !product.is_active && 'opacity-50',
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium line-clamp-1">{product.title}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-muted-foreground line-clamp-1">{product.description}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span>{product.stock}</span>
                          {product.stock === 0 && (
                            <Badge variant="destructive" className="w-fit text-[10px]">
                              Out of stock
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {product.is_active ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditing(product)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(product.product_id)}
                                disabled={remove.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReactivate(product.product_id)}
                              disabled={update.isPending}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products yet</p>
              <Button onClick={() => setOpenForm(true)}>Add Your First Product</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
