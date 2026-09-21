import { ShoppingBag } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-muted/30">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="size-5" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">ShopAgent</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
        <p className="mt-8 text-center text-xs text-muted-foreground text-balance">
          Your AI shopping assistant — search, compare and check out, all in one chat.
        </p>
      </div>
    </main>
  )
}
