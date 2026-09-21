"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addressSchema, type AddressValues } from "@/lib/schemas"
import type { AddressResponse } from "@/types/api"

interface AddressFormProps {
  initial?: AddressResponse
  onSubmit: (values: AddressValues) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save address",
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      line1: initial?.line1 ?? "",
      line2: initial?.line2 ?? "",
      city: initial?.city ?? "",
      state: initial?.state ?? "",
      pincode: initial?.pincode ?? "",
      country: initial?.country ?? "India",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field label="Address line 1" error={errors.line1?.message}>
        <Input {...register("line1")} placeholder="House no, street" />
      </Field>
      <Field label="Address line 2" error={errors.line2?.message}>
        <Input {...register("line2")} placeholder="Apartment, landmark (optional)" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" error={errors.city?.message}>
          <Input {...register("city")} />
        </Field>
        <Field label="State" error={errors.state?.message}>
          <Input {...register("state")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Pincode" error={errors.pincode?.message}>
          <Input {...register("pincode")} inputMode="numeric" />
        </Field>
        <Field label="Country" error={errors.country?.message}>
          <Input {...register("country")} />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
