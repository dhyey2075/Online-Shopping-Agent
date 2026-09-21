"use client"

import { useRef, useState, type KeyboardEvent } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  onSend: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder ?? "Ask me to find anything..."}
          disabled={disabled}
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-muted-foreground">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </div>
  )
}
