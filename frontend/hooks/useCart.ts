"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cartService } from "@/services/cartService"
import { extractApiError } from "@/services/apiClient"

export function useCart(threadId: string | undefined) {
  return useQuery({
    queryKey: ["cart", threadId],
    enabled: Boolean(threadId),
    queryFn: () => cartService.get(threadId as string),
  })
}

export function useCartMutations(threadId: string | undefined) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart", threadId] })

  const add = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      cartService.add(threadId as string, productId, quantity ?? 1),
    onSuccess: invalidate,
    onError: (err) => toast.error(extractApiError(err, "Could not add to cart")),
  })

  const remove = useMutation({
    mutationFn: (cartItemId: string) => cartService.remove(threadId as string, cartItemId),
    onSuccess: invalidate,
    onError: (err) => toast.error(extractApiError(err)),
  })

  const update = useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      cartService.update(threadId as string, cartItemId, quantity),
    onSuccess: invalidate,
    onError: (err) => toast.error(extractApiError(err)),
  })

  const clear = useMutation({
    mutationFn: () => cartService.clear(threadId as string),
    onSuccess: invalidate,
    onError: (err) => toast.error(extractApiError(err)),
  })

  return { add, remove, update, clear }
}
