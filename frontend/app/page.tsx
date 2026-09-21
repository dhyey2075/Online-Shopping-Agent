"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function Home() {
  const router = useRouter()
  const { hasHydrated, isAuthenticated, user, role } = useAuth()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) {
      router.replace("/auth/login")
      return
    }
    if (user && user.has_password === false) {
      router.replace("/auth/create-password")
      return
    }
    router.replace(role === "seller" ? "/seller" : "/buyer/chat")
  }, [hasHydrated, isAuthenticated, user, role, router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </main>
  )
}
