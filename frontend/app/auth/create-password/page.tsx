"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SellerUpsellModal } from "@/components/auth/SellerUpsellModal"
import { createPasswordSchema, type CreatePasswordValues } from "@/lib/schemas"
import { authService } from "@/services/authService"
import { extractApiError } from "@/services/apiClient"
import { useAuth } from "@/hooks/useAuth"
import { useOnboarding } from "@/hooks/useOnboarding"

export default function CreatePasswordPage() {
  const router = useRouter()
  const { hasHydrated, isAuthenticated } = useAuth()
  const { upsellOpen, beginOnboarding, completeAsSeller, completeAsBuyer } = useOnboarding()
  const [submitting, setSubmitting] = useState(false)

  // Cannot reach this screen unauthenticated.
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace("/auth/login")
  }, [hasHydrated, isAuthenticated, router])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreatePasswordValues>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  })

  async function onSubmit(values: CreatePasswordValues) {
    setSubmitting(true)
    try {
      await authService.createPassword(values.password)
      // hydrate + show upsell (brand-new account, flag will be absent)
      await beginOnboarding({ forceUpsell: true })
    } catch (err) {
      setError("password", { message: extractApiError(err, "Could not set password") })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Create a password</CardTitle>
          <CardDescription>
            Secure your account with a password so you can sign in any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  8+ chars with an uppercase, lowercase and a digit.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" autoComplete="new-password" {...register("confirm")} />
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Set password &amp; continue
            </Button>
          </form>
        </CardContent>
      </Card>

      <SellerUpsellModal
        open={upsellOpen}
        onBecomeSeller={completeAsSeller}
        onContinueAsBuyer={completeAsBuyer}
      />
    </>
  )
}
