"use client"

import { GoogleLogin } from "@react-oauth/google"
import { toast } from "sonner"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

interface GoogleAuthButtonProps {
  onCredential: (idToken: string) => void
}

export function GoogleAuthButton({ onCredential }: GoogleAuthButtonProps) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/40 p-2.5 text-center text-xs text-muted-foreground">
        Google sign-in is unavailable — set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable it.
      </p>
    )
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse.credential) {
            onCredential(credentialResponse.credential)
          } else {
            toast.error("Google did not return a credential")
          }
        }}
        onError={() => toast.error("Google sign-in failed")}
        width="320"
      />
    </div>
  )
}
