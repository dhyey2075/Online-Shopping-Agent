"use client"

import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import {
  LogOut,
  MessageSquarePlus,
  MoreHorizontal,
  Package,
  Pencil,
  Sparkles,
  Store,
  Trash2,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useThreadList, useThreadMutations } from "@/hooks/useThreads"
import { useAuth } from "@/hooks/useAuth"
import { SellerUpsellModal } from "@/components/auth/SellerUpsellModal"

interface ChatSidebarProps {
  onNavigate?: () => void
}

export function ChatSidebar({ onNavigate }: ChatSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const activeThreadId = (params?.threadId as string) ?? null

  const { data: threads, isLoading } = useThreadList()
  const { rename, remove } = useThreadMutations()
  const { user, role, logout, refreshUser } = useAuth()

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [upsellOpen, setUpsellOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.replace("/auth/login")
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold">ShopAgent</span>
      </div>

      <div className="px-3">
        <Button
          className="w-full justify-start gap-2"
          onClick={() => {
            router.push("/buyer/chat")
            onNavigate?.()
          }}
        >
          <MessageSquarePlus className="h-4 w-4" /> New chat
        </Button>
      </div>

      <nav className="mt-3 flex-1 overflow-y-auto px-2">
        <p className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Conversations
        </p>
        {isLoading ? (
          <div className="space-y-2 px-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ) : !threads || threads.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          <ul className="space-y-0.5">
            {threads.map((thread) => {
              const active = thread.thread_id === activeThreadId
              const isRenaming = renamingId === thread.thread_id
              return (
                <li key={thread.thread_id} className="group relative">
                  {isRenaming ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const title = renameValue.trim()
                        if (title) rename.mutate({ threadId: thread.thread_id, title })
                        setRenamingId(null)
                      }}
                      className="px-1 py-0.5"
                    >
                      <Input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => setRenamingId(null)}
                        className="h-8 text-sm"
                      />
                    </form>
                  ) : (
                    <Link
                      href={`/buyer/chat/${thread.thread_id}`}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <span className="min-w-0 flex-1 pr-1">
                        <span className="line-clamp-1 block">{thread.title || "New chat"}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(thread.updated_at), { addSuffix: true })}
                        </span>
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              onClick={(e) => e.preventDefault()}
                              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-background group-hover:opacity-100 data-[state=open]:opacity-100"
                              aria-label="Thread options"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          }
                        />
                        <DropdownMenuContent align="end" onClick={(e) => e.preventDefault()}>
                          <DropdownMenuItem
                            onClick={() => {
                              setRenamingId(thread.thread_id)
                              setRenameValue(thread.title)
                            }}
                          >
                            <Pencil className="h-4 w-4" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(thread.thread_id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </nav>

      <div className="border-t border-border p-2">
        <Link
          href="/buyer/orders"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted",
            pathname === "/buyer/orders" && "bg-accent text-accent-foreground",
          )}
        >
          <Package className="h-4 w-4" /> My orders
        </Link>

        {role === "seller" ? (
          <Link
            href="/seller"
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
          >
            <Store className="h-4 w-4" /> Seller dashboard
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setUpsellOpen(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
          >
            <Store className="h-4 w-4" /> Become a seller
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <User className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate">
                  <span className="block truncate font-medium">{user?.name ?? "Account"}</span>
                  <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
                </span>
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => router.push("/buyer/profile")}>
              <User className="h-4 w-4" /> Profile & addresses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/buyer/orders")}>
              <Package className="h-4 w-4" /> My orders
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the conversation and its cart. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  remove.mutate(deleteId)
                  if (deleteId === activeThreadId) router.push("/buyer/chat")
                }
                setDeleteId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SellerUpsellModal
        open={upsellOpen}
        onBecomeSeller={async () => {
          try {
            await refreshUser()
          } catch {
            /* ignore */
          }
          setUpsellOpen(false)
          router.push("/seller")
        }}
        onContinueAsBuyer={() => {
          setUpsellOpen(false)
        }}
      />
    </div>
  )
}
