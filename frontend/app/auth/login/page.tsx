"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { loginSchema, type LoginValues } from "@/lib/schemas"
import { authService } from "@/services/authService"
import { extractApiError } from "@/services/apiClient"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { setToken, refreshUser } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    setSubmitting(true)
    try {
      const token = await authService.login(values)
      setToken(token.access_token)
      const me = await refreshUser()
      router.replace(me.role === "seller" ? "/seller" : "/buyer/chat")
    } catch (err) {
      setError("password", { message: extractApiError(err, "Invalid email or password") })
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
        // first-ever Google login — must set a password first (and only there
        // do we ask for buyer/seller, since it's the only truly first-time path)
        router.replace("/auth/create-password")
        return
      }
      // Reaching the login page via Google with a password already set means
      // this account has signed in before — its role was decided long ago.
      // No onboarding/upsell needed here, just route by existing role.
      const me = await refreshUser()
      router.replace(me.role === "seller" ? "/seller" : "/buyer/chat")
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
          <CardTitle className="font-heading text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue shopping with your assistant.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <GoogleAuthButton onCredential={handleGoogle} />

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  )
}
