'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from '@/components/shared/ProfileForm'
import { AddressList } from '@/components/shared/AddressList'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={user.role === 'seller' ? 'default' : 'secondary'}>{user.role}</Badge>
          </div>

          <ProfileForm user={user} />

          <Separator />

          <div className="flex gap-2">
            {user.role === 'customer' && (
              <Link href="/seller">
                <Button variant="outline">Become a Seller</Button>
              </Link>
            )}
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddressList />
    </div>
  )
}
