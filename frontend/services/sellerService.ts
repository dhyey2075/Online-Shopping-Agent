import { apiClient } from "./apiClient"
import type {
  LocalProductCreateRequest,
  LocalProductResponse,
  LocalProductUpdateRequest,
  SellerDashboardSummary,
  SellerOrderListResponse,
  SellerProfileResponse,
  SellerProfileUpdateRequest,
  SellerRegisterRequest,
} from "@/types/api"

export const sellerService = {
  async register(body: SellerRegisterRequest): Promise<SellerProfileResponse> {
    const { data } = await apiClient.post<SellerProfileResponse>("/seller/register", body)
    return data
  },

  async profile(): Promise<SellerProfileResponse> {
    const { data } = await apiClient.get<SellerProfileResponse>("/seller/profile")
    return data
  },

  async updateProfile(body: SellerProfileUpdateRequest): Promise<SellerProfileResponse> {
    const { data } = await apiClient.put<SellerProfileResponse>("/seller/profile", body)
    return data
  },

  async dashboard(): Promise<SellerDashboardSummary> {
    const { data } = await apiClient.get<SellerDashboardSummary>("/seller/dashboard")
    return data
  },

  async products(): Promise<LocalProductResponse[]> {
    const { data } = await apiClient.get<LocalProductResponse[]>("/seller/products")
    return data
  },

  async createProduct(body: LocalProductCreateRequest): Promise<LocalProductResponse> {
    const { data } = await apiClient.post<LocalProductResponse>("/seller/products", body)
    return data
  },

  async updateProduct(docId: string, body: LocalProductUpdateRequest): Promise<LocalProductResponse> {
    const { data } = await apiClient.put<LocalProductResponse>(`/seller/products/${docId}`, body)
    return data
  },

  async deleteProduct(docId: string): Promise<void> {
    await apiClient.delete(`/seller/products/${docId}`)
  },

  async orders(): Promise<SellerOrderListResponse> {
    const { data } = await apiClient.get<SellerOrderListResponse>("/seller/orders")
    return data
  },

  async ordersHistory(): Promise<SellerOrderListResponse> {
    const { data } = await apiClient.get<SellerOrderListResponse>("/seller/orders/history")
    return data
  },

  async dispatch(orderId: string): Promise<void> {
    await apiClient.post(`/seller/orders/${orderId}/dispatch`)
  },
}
