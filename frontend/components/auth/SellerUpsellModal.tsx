"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Store, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sellerRegisterSchema, type SellerRegisterValues } from "@/lib/schemas"
import { sellerService } from "@/services/sellerService"
import { extractApiError } from "@/services/apiClient"
import { toast } from "sonner"

interface SellerUpsellModalProps {
  open: boolean
  onBecomeSeller: () => void // called after successful seller registration
  onContinueAsBuyer: () => void
}

export function SellerUpsellModal({
  open,
  onBecomeSeller,
  onContinueAsBuyer,
}: SellerUpsellModalProps) {
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SellerRegisterValues>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: { shop_name: "", description: "" },
  })

  async function onSubmit(values: SellerRegisterValues) {
    setSubmitting(true)
    try {
      await sellerService.register({
        shop_name: values.shop_name,
        description: values.description || undefined,
      })
      onBecomeSeller()
    } catch (err) {
      toast.error(extractApiError(err, "Could not register as a seller"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Store className="size-5" />
          </div>
          <DialogTitle>Want to sell on our platform too?</DialogTitle>
          <DialogDescription>
            {showForm
              ? "Set up your shop to start listing products for buyers."
              : "You can keep shopping as a buyer, or open a shop and start selling alongside it."}
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="mt-2 flex flex-col gap-2">
            <Button onClick={() => setShowForm(true)}>Yes, become a seller</Button>
            <Button variant="ghost" onClick={onContinueAsBuyer}>
              Not now, continue as buyer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shop_name">Shop name</Label>
              <Input id="shop_name" placeholder="My Awesome Shop" {...register("shop_name")} />
              {errors.shop_name && (
                <p className="text-xs text-destructive">{errors.shop_name.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What do you sell?"
                {...register("description")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Create shop &amp; continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={onContinueAsBuyer}
              >
                Skip for now
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
