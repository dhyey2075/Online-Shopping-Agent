"use client"

import { useState } from "react"
import { Check, MapPin, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAddresses } from "@/hooks/useAddresses"
import { AddressForm } from "./AddressForm"
import type { AddressResponse } from "@/types/api"

interface AddressPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedId: string | null
  onSelect: (address: AddressResponse) => void
}

export function AddressPickerModal({
  open,
  onOpenChange,
  selectedId,
  onSelect,
}: AddressPickerModalProps) {
  const { addresses, add } = useAddresses()
  const [adding, setAdding] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select delivery address</DialogTitle>
        </DialogHeader>

        {adding || addresses.length === 0 ? (
          <div className="space-y-3">
            {addresses.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Back to saved addresses
              </Button>
            )}
            <AddressForm
              isSubmitting={add.isPending}
              submitLabel="Save & use"
              onCancel={addresses.length > 0 ? () => setAdding(false) : undefined}
              onSubmit={async (values) => {
                const created = await add.mutateAsync({
                  ...values,
                  line2: values.line2 ?? "",
                })
                setAdding(false)
                onSelect(created)
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {addresses.map((addr) => {
              const active = addr.id === selectedId
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelect(addr)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-accent"
                      : "border-border hover:border-primary/50 hover:bg-muted/50",
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm leading-relaxed">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.pincode},{" "}
                    {addr.country}
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              )
            })}

            <Button variant="outline" className="w-full" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" /> Add new address
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
