"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { productSchema, type ProductValues } from "@/lib/schemas"
import type { LocalProductResponse } from "@/types/api"
import type { z } from "zod"

// react-hook-form's field values are the *pre-coercion* shape (what the
// inputs actually produce — strings), while ProductValues is the
// *post-coercion* output of productSchema. z.input<> gives us that pre-zod
// shape so useForm/zodResolver agree on a single generic.
type ProductFormFields = z.input<typeof productSchema>

interface ProductFormProps {
  initial?: LocalProductResponse
  onSubmit: (values: ProductValues) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function ProductForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save product",
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormFields>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      price: initial?.price ?? 0,
      currency: initial?.currency ?? "INR",
      category: initial?.category ?? "",
      image: initial?.image ?? "",
      stock: initial?.stock ?? 0,
    },
  })

  const submit = handleSubmit((values) => onSubmit(values as ProductValues))

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Product title" error={errors.title?.message}>
        <Input {...register("title")} placeholder="e.g., Wireless Headphones" />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <Textarea {...register("description")} placeholder="Describe the product" rows={3} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price" error={errors.price?.message}>
          <Input type="number" step="0.01" {...register("price")} placeholder="0.00" />
        </Field>
        <Field label="Stock" error={errors.stock?.message}>
          <Input type="number" {...register("stock")} placeholder="0" />
        </Field>
      </div>

      <Field label="Category" error={errors.category?.message}>
        <Input {...register("category")} placeholder="e.g., Electronics" />
      </Field>

      <Field label="Image URL" error={errors.image?.message}>
        <Input {...register("image")} placeholder="https://..." />
      </Field>

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
