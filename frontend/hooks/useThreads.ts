"use client"

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { threadService } from "@/services/threadService"
import type { ThreadDetailResponse } from "@/types/api"

export function useThreadList(enabled = true) {
  return useQuery({
    queryKey: ["threads"],
    queryFn: () => threadService.list(),
    enabled,
    refetchOnWindowFocus: true,
    staleTime: 10 * 1000,
  })
}

export function useThreadMessages(threadId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["thread", threadId],
    enabled: Boolean(threadId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      threadService.detail(threadId as string, { limit: 30, before: pageParam }),
    getNextPageParam: (lastPage: ThreadDetailResponse) =>
      lastPage.has_more ? (lastPage.next_cursor ?? undefined) : undefined,
  })
}

export function useThreadMutations() {
  const qc = useQueryClient()

  const rename = useMutation({
    mutationFn: ({ threadId, title }: { threadId: string; title: string }) =>
      threadService.rename(threadId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  })

  const remove = useMutation({
    mutationFn: (threadId: string) => threadService.remove(threadId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  })

  return { rename, remove }
}
