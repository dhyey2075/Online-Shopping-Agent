import type { ReactNode } from "react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { BuyerShell } from "@/components/chat/BuyerShell"

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      <BuyerShell>{children}</BuyerShell>
    </RouteGuard>
  )
}
