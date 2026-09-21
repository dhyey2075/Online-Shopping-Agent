"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { authService } from "@/services/authService"
import { extractApiError } from "@/services/apiClient"
import { useAuth } from "./useAuth"
import type { AddressRequest } from "@/types/api"

export function useAddresses() {
  const { user, refreshUser } = useAuth()

  const add = useMutation({
    mutationFn: (body: AddressRequest) => authService.addAddress(body),
    onSuccess: async () => {
      await refreshUser()
      toast.success("Address added")
    },
    onError: (err) => toast.error(extractApiError(err, "Could not add address")),
  })

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddressRequest }) =>
      authService.updateAddress(id, body),
    onSuccess: async () => {
      await refreshUser()
      toast.success("Address updated")
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  const remove = useMutation({
    mutationFn: (id: string) => authService.deleteAddress(id),
    onSuccess: async () => {
      await refreshUser()
      toast.success("Address removed")
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  const setDefault = useMutation({
    mutationFn: (id: string) => authService.setDefaultAddress(id),
    onSuccess: async () => {
      await refreshUser()
    },
    onError: (err) => toast.error(extractApiError(err)),
  })

  return {
    addresses: user?.addresses ?? [],
    defaultAddressId: user?.default_address_id ?? null,
    add,
    update,
    remove,
    setDefault,
  }
}
