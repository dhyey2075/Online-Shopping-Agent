import { apiClient } from "./apiClient"
import type {
  AddressRequest,
  AddressResponse,
  TokenResponse,
  UserResponse,
} from "@/types/api"

export interface SignupRequest {
  name: string
  email: string
  password: string
  phone?: string
}

export const authService = {
  async signup(body: SignupRequest): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/auth/signup", body)
    return data
  },

  async login(body: { email: string; password: string }): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/auth/login", body)
    return data
  },

  async google(idToken: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>("/auth/google", { id_token: idToken })
    return data
  },

  async createPassword(password: string): Promise<void> {
    await apiClient.post("/auth/create-password", { password })
  },

  async me(): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>("/auth/me")
    return data
  },

  // Records that the user explicitly chose to continue as a buyer (dismissed
  // the seller-upsell modal). Server-side + device-independent — see
  // `role_selected` on UserResponse.
  async continueAsBuyer(): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>("/auth/role-selected")
    return data
  },

  async update(body: { name?: string; phone?: string }): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>("/auth/update", body)
    return data
  },

  async addAddress(body: AddressRequest): Promise<AddressResponse> {
    const { data } = await apiClient.post<AddressResponse>("/auth/address", body)
    return data
  },

  async updateAddress(id: string, body: AddressRequest): Promise<void> {
    await apiClient.put(`/auth/address/${id}`, body)
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/auth/address/${id}`)
  },

  async setDefaultAddress(id: string): Promise<void> {
    await apiClient.put(`/auth/address/${id}/default`)
  },
}
