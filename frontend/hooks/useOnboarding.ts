"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { authService } from "@/services/authService"

/**
 * Shared post-auth onboarding: hydrate user via /auth/me, decide whether to show
 * the seller-upsell modal, and route accordingly. Used by both signup and the
 * first-Google-login (create-password) flow per spec §2.
 *
 * The "has this account already decided buyer vs seller" flag lives on the
 * user document (`role_selected`) rather than in localStorage, so the
 * decision is remembered no matter which device/browser the user logs in
 * from next.
 */
export function useOnboarding() {
  const router = useRouter()
  const { refreshUser, setUser } = useAuth()
  const [upsellOpen, setUpsellOpen] = useState(false)

  // Returns true if the upsell modal is now showing (caller should render it).
  const beginOnboarding = useCallback(
    async (opts?: { forceUpsell?: boolean }) => {
      const me = await refreshUser()

      const shouldShow = opts?.forceUpsell || !me.role_selected

      if (shouldShow) {
        setUpsellOpen(true)
        return true
      }

      // Already decided: route straight in by role.
      router.replace(me.role === "seller" ? "/seller" : "/buyer/chat")
      return false
    },
    [refreshUser, router],
  )

  // Called when the user becomes a seller via the upsell.
  // /seller/register already sets role_selected=true server-side, so we just
  // need to refresh local state before routing.
  const completeAsSeller = useCallback(async () => {
    try {
      const me = await refreshUser()
      setUser(me)
    } catch {
      /* ignore */
    }
    setUpsellOpen(false)
    router.replace("/seller")
  }, [refreshUser, setUser, router])

  // Called when the user dismisses the upsell / continues as buyer.
  const completeAsBuyer = useCallback(async () => {
    try {
      const me = await authService.continueAsBuyer()
      setUser(me)
    } catch {
      /* ignore — worst case they see the upsell again next time */
    }
    setUpsellOpen(false)
    router.replace("/buyer/chat")
  }, [setUser, router])

  return { upsellOpen, beginOnboarding, completeAsSeller, completeAsBuyer }
}
