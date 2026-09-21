import type { PaymentInitResponse, RazorpayResponse } from "@/types/api"

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js"

let scriptPromise: Promise<void> | null = null

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")))
      if (window.Razorpay) resolve()
      return
    }
    const script = document.createElement("script")
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error("Failed to load Razorpay"))
    }
    document.body.appendChild(script)
  })
  return scriptPromise
}

interface OpenWidgetArgs {
  init: PaymentInitResponse
  shopName?: string
  prefill?: { name?: string; email?: string; contact?: string }
  onSuccess: (resp: RazorpayResponse) => void
  onFailure: () => void
  onDismiss: () => void
}

export async function openRazorpayWidget({
  init,
  shopName = "ShopAgent",
  prefill,
  onSuccess,
  onFailure,
  onDismiss,
}: OpenWidgetArgs): Promise<void> {
  await loadRazorpayScript()
  if (!window.Razorpay) throw new Error("Razorpay unavailable")

  const rzp = new window.Razorpay({
    key: init.razorpay_key_id,
    order_id: init.razorpay_order_id,
    amount: init.amount,
    currency: init.currency,
    name: shopName,
    description: "Order payment",
    prefill,
    handler: (response: RazorpayResponse) => onSuccess(response),
    modal: { ondismiss: () => onDismiss() },
  })
  rzp.on("payment.failed", () => onFailure())
  rzp.open()
}
