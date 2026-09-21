"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/useAuthStore"
import { authService } from "@/services/authService"
import { extractApiError } from "@/services/apiClient"

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const setToken = useAuthStore((s) => s.setToken)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  // Hydrate user/role from the server (never persist stale user data).
  async function refreshUser() {
    const me = await authService.me()
    setUser(me)
    return me
  }

  return {
    accessToken,
    user,
    role,
    hasHydrated,
    isAuthenticated: Boolean(accessToken),
    setToken,
    setUser,
    refreshUser,
    logout,
  }
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (body: { name?: string; phone?: string }) => authService.update(body),
    onSuccess: (user) => {
      setUser(user)
      toast.success("Profile updated")
    },
    onError: (err) => toast.error(extractApiError(err, "Could not update profile")),
  })
}
