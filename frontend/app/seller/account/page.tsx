'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProfileForm } from '@/components/shared/ProfileForm'
import { AddressList } from '@/components/shared/AddressList'

export default function SellerAccountPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">Manage your personal details and addresses</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your name, email, and phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      {/* Addresses — same shared component used on the buyer side */}
      <AddressList />

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Logout from your account</p>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
