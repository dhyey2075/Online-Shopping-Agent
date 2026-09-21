"use client"

import { Sparkles } from "lucide-react"
import { ChatInput } from "@/components/chat/ChatInput"
import { useSearch } from "@/hooks/useSearch"

const SUGGESTIONS = [
  "Find wireless earbuds under ₹3000",
  "I need a gift for a coffee lover",
  "Show me running shoes for flat feet",
  "Best budget mechanical keyboards",
]

export default function NewChatPage() {
  const { send, isStreaming } = useSearch()

  const handleSend = (value: string) => {
    void send({ query: value })
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-balance text-center text-2xl font-semibold md:text-3xl">
          What are you shopping for today?
        </h1>
        <p className="mt-2 max-w-md text-pretty text-center text-sm text-muted-foreground">
          Describe what you need and your AI agent will find products, compare options, and help you
          check out — all in one chat.
        </p>

        <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={isStreaming}
              onClick={() => handleSend(s)}
              className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:border-primary/50 hover:bg-accent disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ChatInput onSend={handleSend} disabled={isStreaming} placeholder="Message ShopAgent..." />
    </div>
  )
}
