"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { sellerService } from "@/services/sellerService"
import { extractApiError } from "@/services/apiClient"
import type { LocalProductCreateRequest, LocalProductUpdateRequest } from "@/types/api"

export function useSellerDashboard() {
  return useQuery({
    queryKey: ["seller", "dashboard"],
    queryFn: () => sellerService.dashboard(),
    staleTime: 20 * 1000,
    refetchInterval: 45 * 1000,
  })
}

export function useSellerProducts() {
  return useQuery({
    queryKey: ["seller", "products"],
    queryFn: () => sellerService.products(),
  })
}

export function useSellerProductMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["seller", "products"] })
    qc.invalidateQueries({ queryKey: ["seller", "dashboard"] })
  }

  const create = useMutation({
    mutationFn: (body: LocalProductCreateRequest) => sellerService.createProduct(body),
    onSuccess: () => {
      invalidate()
      toast.success("Product created")
    },
    onError: (err) => toast.error(extractApiError(err, "Could not create product")),
  })

  const update = useMutation({
    mutationFn: ({ docId, body }: { docId: string; body: LocalProductUpdateRequest }) =>
      sellerService.updateProduct(docId, body),
    onSuccess: () => {
      invalidate()
      toast.success("Product updated")
    },
    onError: (err) => toast.error(extractApiError(err, "Could not update product")),
  })

  const remove = useMutation({
    mutationFn: (docId: string) => sellerService.deleteProduct(docId),
    onSuccess: () => {
      invalidate()
      toast.success("Product deactivated")
    },
    onError: (err) => toast.error(extractApiError(err, "Could not delete product")),
  })

  return { create, update, remove }
}
