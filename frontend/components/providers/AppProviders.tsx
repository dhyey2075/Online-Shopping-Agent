"use client"

import { useEffect, useRef, useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { Toaster } from "sonner"
import { getQueryClient } from "@/lib/queryClient"
import { useAuthStore } from "@/stores/useAuthStore"
import { authService } from "@/services/authService"
import { setUnauthorizedHandler } from "@/services/apiClient"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())
  const bootstrapped = useRef(false)

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    const store = useAuthStore.getState()
    store.hydrateFromStorage()

    setUnauthorizedHandler(() => {
      useAuthStore.getState().logout()
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/login")) {
        window.location.assign("/auth/login")
      }
    })

    const token = useAuthStore.getState().accessToken
    if (token) {
      authService
        .me()
        .then((me) => store.setUser(me))
        .catch(() => {
          /* interceptor handles 401 */
        })
        .finally(() => store.setHydrated(true))
    } else {
      store.setHydrated(true)
    }
  }, [])

  const content = (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </QueryClientProvider>
  )

  if (!GOOGLE_CLIENT_ID) return content
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider>
}
