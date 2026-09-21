// Single source of truth for every backend interface (see spec §1).

export interface TokenResponse {
  access_token: string
  token_type: "bearer"
  profile_completed: boolean
  has_password: boolean
}

export interface AddressResponse {
  id: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface AddressRequest {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export type UserRole = "customer" | "seller"

export interface UserResponse {
  user_id: string
  name: string
  email: string
  phone: string | null
  profile_completed: boolean
  addresses: AddressResponse[]
  default_address_id: string | null
  has_password: boolean
  role: UserRole
  seller_id: string | null
  // Server-side, device-independent flag: true once the user has explicitly
  // chosen buyer/seller during onboarding. Replaces the old localStorage-based
  // "seller_upsell_shown:<userId>" flag.
  role_selected: boolean
}

// ---- Seller ----

export interface SellerProfileResponse {
  seller_id: string
  shop_name: string
  description: string
  is_active: boolean
}

export interface SellerProfileUpdateRequest {
  shop_name?: string
  description?: string
}

export interface SellerRegisterRequest {
  shop_name: string
  description?: string
}

export interface SellerDashboardSummary {
  total_products: number
  active_products: number
  active_orders: number
  pending_dispatches: number
}

export interface LocalProductResponse {
  product_id: string // "local_<doc_id>"
  seller_id: string
  title: string
  description: string
  price: number
  currency: string
  category: string
  keywords: string[]
  image: string
  stock: number
  is_active: boolean
  attributes: Record<string, unknown>
}

export interface LocalProductCreateRequest {
  title: string
  description?: string
  price: number
  currency?: string
  category?: string
  keywords?: string[]
  image?: string
  stock?: number
  attributes?: Record<string, unknown>
}

export interface LocalProductUpdateRequest extends Partial<LocalProductCreateRequest> {
  is_active?: boolean
}

export type OrderStatus = "PENDING_PAYMENT" | "PAID" | "DISPATCHED" | "COMPLETED"

export interface PriceSchema {
  value: number
  currency: string
}

export interface OrderItem {
  product_id: string
  title: string
  price: PriceSchema
  quantity: number
  source: string
  image: string
  seller_id: string | null
}

export interface SellerSubOrder {
  order_id: string
  user_id: string
  status: OrderStatus
  items: OrderItem[]
  total: number
  currency: string
  delivery_address: AddressResponse
  created_at: string
}

export interface SellerOrderListResponse {
  orders: SellerSubOrder[]
}

// ---- Threads ----

export interface ThreadSummaryResponse {
  thread_id: string
  title: string
  updated_at: string
}

export interface MessageProduct {
  product_id: string
  title: string
  price: PriceSchema
  image: string
  url: string
  rating: number
  source: string
  short_reason: string
  can_buy_here: boolean
  redirect_url: string
  cart_supported: boolean
  seller_id: string
  category: string
}

export interface ExternalItem {
  cart_item_id: string
  product_id: string
  title: string
  price: PriceSchema
  image: string
  redirect_url: string
  source: string
  can_buy_here: false
}

export type MessageRole = "user" | "assistant" | "tool" | "system"

export interface MessageSchema {
  role: MessageRole
  content: string
  products: MessageProduct[]
  external_items: ExternalItem[]
  has_external: boolean
}

export interface ThreadDetailResponse {
  thread_id: string
  messages: MessageSchema[]
  has_more: boolean
  next_cursor: string | null
}

// ---- Search ----

export interface SearchRequest {
  query: string
  thread_id?: string
}

export type CheckoutStep =
  | "init"
  | "items_selected"
  | "address_selected"
  | "payment_required"
  | "payment_created"
  | "done"

export interface CheckoutStateSchema {
  active: boolean
  step: CheckoutStep | null
  selected_cart_items: string[]
  selected_address_id: string | null
  current_order_id: string | null
  razorpay_order_id: string | null
  payment_status: string | null
  has_external: boolean
}

export interface SearchResponse {
  thread_id: string
  content: string
  products: MessageProduct[]
  external_items: ExternalItem[]
  has_external: boolean
  checkout: CheckoutStateSchema | null
}

// ---- Cart ----

export interface CartItemResponse {
  cart_item_id: string
  product_id: string
  title: string
  price: PriceSchema
  image: string
  url: string
  source: string
  can_buy_here: boolean
  redirect_url: string
  quantity: number
}

export interface CartResponse {
  thread_id: string
  items: CartItemResponse[]
  purchasable_count: number
  external_count: number
  estimated_total: number
  currency: string
}

// ---- Checkout / Payment ----

export interface CreatePaymentRequest {
  thread_id: string
  address_id: string
}

export interface PaymentInitResponse {
  order_id: string
  razorpay_order_id: string
  razorpay_key_id: string
  amount: number // smallest currency unit
  currency: string
}

export interface ConfirmPaymentRequest {
  thread_id: string
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface OrderConfirmationResponse {
  order_id: string
  status: "paid"
  total: number
  currency: string
  items_count: number
  message: string
}

export type NotifyEvent = "payment_success" | "payment_failed" | "payment_cancelled"

export interface NotifyOrderRequest {
  thread_id: string
  event: NotifyEvent
  order_id?: string
  message?: string
}

export interface NotifyOrderResponse {
  ok: boolean
  thread_id: string
  event: string
}

// ---- Orders (buyer) ----

export interface BuyerOrderListItem {
  order_id: string
  user_id: string
  thread_id: string
  items: OrderItem[]
  delivery_address: AddressResponse
  subtotal: number
  total: number
  currency: string
  status: OrderStatus
  razorpay_order_id: string | null
  created_at: string
}

export interface SellerSubOrderDoc {
  order_id: string
  seller_id: string | null
  status: OrderStatus
  items: OrderItem[]
  total?: number
  currency?: string
  created_at?: string
}

export interface BuyerOrderDetail extends BuyerOrderListItem {
  seller_sub_orders: SellerSubOrderDoc[]
}

// ---- Feedback ----

export type FeedbackAction = "click" | "like" | "ignore"

export interface FeedbackRequest {
  thread_id: string
  product_id: string
  action: FeedbackAction
}

// ---- Razorpay widget ----

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void
      on: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}
