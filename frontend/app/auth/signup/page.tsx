"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { SellerUpsellModal } from "@/components/auth/SellerUpsellModal"
import { signupSchema, type SignupValues } from "@/lib/schemas"
import { authService } from "@/services/authService"
import { extractApiError, getApiStatus } from "@/services/apiClient"
import { useAuth } from "@/hooks/useAuth"
import { useOnboarding } from "@/hooks/useOnboarding"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SignupPage() {
  const router = useRouter()
  const { setToken } = useAuth()
  const { upsellOpen, beginOnboarding, completeAsSeller, completeAsBuyer } = useOnboarding()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
  })

  async function onSubmit(values: SignupValues) {
    setSubmitting(true)
    try {
      const token = await authService.signup({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      })
      setToken(token.access_token)
      // signup always offers the upsell (unless already seen for this account)
      await beginOnboarding({ forceUpsell: true })
    } catch (err) {
      const status = getApiStatus(err)
      const msg = extractApiError(err)
      if (status === 409) {
        setError("email", { message: "This email is already registered" })
      } else if (status === 400) {
        setError("password", { message: msg })
      } else {
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle(idToken: string) {
    setSubmitting(true)
    try {
      const token = await authService.google(idToken)
      setToken(token.access_token)
      if (token.has_password === false) {
        router.replace("/auth/create-password")
        return
      }
      await beginOnboarding()
    } catch (err) {
      toast.error(extractApiError(err, "Google sign-in failed"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Create your account</CardTitle>
          <CardDescription>Start shopping smarter with your AI assistant.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  8+ chars with an uppercase, lowercase and a digit.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <GoogleAuthButton onCredential={handleGoogle} />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
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
