"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import type { UserRole } from "@/types/api"

interface RouteGuardProps {
  children: React.ReactNode
  requireRole?: UserRole
}

export function RouteGuard({ children, requireRole }: RouteGuardProps) {
  const router = useRouter()
  const { hasHydrated, isAuthenticated, user, role } = useAuth()

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.replace("/auth/login")
      return
    }

    // First-ever Google login: must create a password before anything else.
    if (user && user.has_password === false) {
      router.replace("/auth/create-password")
      return
    }

    // Role boundary (friendly UX redirect, not a 403).
    if (requireRole && role && role !== requireRole) {
      router.replace(role === "seller" ? "/seller" : "/buyer/chat")
    }
  }, [hasHydrated, isAuthenticated, user, role, requireRole, router])

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (user && user.has_password === false) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
