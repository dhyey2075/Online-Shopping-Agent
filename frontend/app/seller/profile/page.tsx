'use client'

import { useEffect, useState } from 'react'
import { useSellerProfile, useSellerProfileMutation } from '@/hooks/useSellerOrders'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function SellerProfilePage() {
  const { data: sellerProfile, isLoading } = useSellerProfile()
  const updateProfile = useSellerProfileMutation()

  const [shopName, setShopName] = useState('')
  const [description, setDescription] = useState('')

  // Populate the form once the shop profile loads (don't fight user typing).
  useEffect(() => {
    if (sellerProfile) {
      setShopName(sellerProfile.shop_name)
      setDescription(sellerProfile.description)
    }
  }, [sellerProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile.mutateAsync({ shop_name: shopName, description })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Shop Profile</h1>
        <p className="text-muted-foreground">How your shop appears to buyers</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>Shop name and description</CardDescription>
            </div>
            {sellerProfile && (
              <Badge variant={sellerProfile.is_active ? 'default' : 'secondary'}>
                {sellerProfile.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop_name">Shop Name</Label>
                <Input
                  id="shop_name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Your shop name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Shop Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your shop"
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
