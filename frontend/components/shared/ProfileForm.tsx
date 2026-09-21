"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { profileSchema, type ProfileValues } from "@/lib/schemas"
import { useUpdateProfile } from "@/hooks/useAuth"
import type { UserResponse } from "@/types/api"

/**
 * Editable name/phone form — PUT /auth/update. Shared by the buyer profile
 * page and the seller account page per spec §3.6 / §4.5.
 */
export function ProfileForm({ user }: { user: UserResponse }) {
  const updateProfile = useUpdateProfile()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? "" },
  })

  return (
    <form
      onSubmit={handleSubmit((values) => updateProfile.mutate(values))}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="profile-name" className="text-xs font-medium text-muted-foreground">
          Name
        </Label>
        <Input id="profile-name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-email" className="text-xs font-medium text-muted-foreground">
          Email
        </Label>
        <Input id="profile-email" value={user.email} disabled />
        <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="profile-phone" className="text-xs font-medium text-muted-foreground">
          Phone
        </Label>
        <Input id="profile-phone" {...register("phone")} placeholder="Optional" />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  )
}
