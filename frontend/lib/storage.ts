// Isolated localStorage access (spec §2). Single source of truth for the
// auth token. Whether a user has decided their buyer/seller role now lives
// server-side on the user document (see `role_selected` in UserResponse) —
// it used to be a localStorage flag here, but that broke as soon as a user
// logged in from a second device/browser (it has no way to know the flag was
// already set elsewhere), so it was removed in favor of the server field.

const TOKEN_KEY = "shopagent_token"

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_KEY)
}
