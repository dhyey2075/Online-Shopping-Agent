'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { LogOut, Menu, Package, BarChart3, FileText, User, MessageSquare, Store } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'

const navItems = [
  { href: '/seller', label: 'Dashboard', icon: BarChart3 },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: FileText },
  { href: '/seller/profile', label: 'Shop Profile', icon: Store },
  { href: '/seller/account', label: 'Account', icon: User },
]

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, role, logout, hasHydrated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!user || role !== 'seller') {
      router.replace('/auth/login')
    }
  }, [user, role, hasHydrated, router])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  if (!hasHydrated || !user) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r bg-card p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="space-y-4">
      <div className="px-2">
        <h2 className="text-lg font-bold text-primary">Seller Hub</h2>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="border-t pt-4 space-y-1">
        <Link href="/buyer/chat">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setMobileOpen(false)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Switch to buyer view
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r bg-card flex-col sticky top-0">
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-4">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden border-b bg-card px-4 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Seller Hub</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
