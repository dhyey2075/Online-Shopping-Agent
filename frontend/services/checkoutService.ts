import { apiClient } from "./apiClient"
import type {
  CheckoutStateSchema,
  ConfirmPaymentRequest,
  CreatePaymentRequest,
  NotifyOrderRequest,
  NotifyOrderResponse,
  OrderConfirmationResponse,
  PaymentInitResponse,
} from "@/types/api"

export const checkoutService = {
  async createPayment(body: CreatePaymentRequest): Promise<PaymentInitResponse> {
    const { data } = await apiClient.post<PaymentInitResponse>("/checkout/payment", body)
    return data
  },

  async confirmPayment(body: ConfirmPaymentRequest): Promise<OrderConfirmationResponse> {
    const { data } = await apiClient.post<OrderConfirmationResponse>("/checkout/confirm", body)
    return data
  },

  async notifyOrderEvent(body: NotifyOrderRequest): Promise<NotifyOrderResponse> {
    const { data } = await apiClient.post<NotifyOrderResponse>("/checkout/notify", body)
    return data
  },

  async getThreadCheckoutState(threadId: string): Promise<CheckoutStateSchema> {
    const { data } = await apiClient.get<CheckoutStateSchema>(`/threads/${threadId}/checkout`)
    return data
  },
}
