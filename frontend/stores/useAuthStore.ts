import { create } from "zustand"
import type { UserResponse, UserRole } from "@/types/api"
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/storage"

interface AuthState {
  accessToken: string | null
  user: UserResponse | null
  role: UserRole | null
  hasHydrated: boolean
  setToken: (token: string) => void
  setUser: (user: UserResponse | null) => void
  hydrateFromStorage: () => void
  setHydrated: (v: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  role: null,
  hasHydrated: false,

  setToken: (token) => {
    setStoredToken(token)
    set({ accessToken: token })
  },

  setUser: (user) => set({ user, role: user?.role ?? null }),

  hydrateFromStorage: () => {
    const token = getStoredToken()
    set({ accessToken: token })
  },

  setHydrated: (v) => set({ hasHydrated: v }),

  logout: () => {
    clearStoredToken()
    set({ accessToken: null, user: null, role: null })
  },
}))
