import axios, { type AxiosInstance } from "axios"
import { getStoredToken } from "@/lib/storage"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// Registered by the app shell so the response interceptor can clear client state.
let unauthorizedHandler: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)

// Helper to surface the backend's `detail` field as a readable message.
export function extractApiError(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === "string") return detail
    if (detail && typeof detail === "object") {
      try {
        return JSON.stringify(detail)
      } catch {
        return fallback
      }
    }
    if (error.message) return error.message
  }
  return fallback
}

export function getApiStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
