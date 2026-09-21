"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddressForm } from "@/components/address/AddressForm"
import { useAddresses } from "@/hooks/useAddresses"
import { Trash2, Plus, Check } from "lucide-react"
import type { AddressValues } from "@/lib/schemas"

/**
 * Full address CRUD card — list, add, edit, delete, set-default. Shared by
 * the buyer profile page and the seller account page (spec §3.6 / §4.5: "one
 * shared component, two route wrappers").
 */
export function AddressList() {
  const { addresses, defaultAddressId, add, update, remove, setDefault } = useAddresses()
  const [openNewForm, setOpenNewForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddAddress = async (values: AddressValues) => {
    await add.mutateAsync({ ...values, line2: values.line2 ?? "" })
    setOpenNewForm(false)
  }

  const handleUpdateAddress = async (values: AddressValues) => {
    if (!editingId) return
    await update.mutateAsync({ id: editingId, body: { ...values, line2: values.line2 ?? "" } })
    setEditingId(null)
  }

  const editingAddress = addresses.find((a) => a.id === editingId)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Saved Addresses</CardTitle>
            <CardDescription>Manage your delivery addresses</CardDescription>
          </div>
          <Dialog open={openNewForm} onOpenChange={setOpenNewForm}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  New Address
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Address</DialogTitle>
                <DialogDescription>Enter your delivery address details</DialogDescription>
              </DialogHeader>
              <AddressForm onSubmit={handleAddAddress} isSubmitting={add.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => {
              const isDefault = address.id === defaultAddressId
              return (
                <div
                  key={address.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3 transition hover:bg-accent"
                >
                  <div className="flex-1">
                    <p className="text-sm">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                      {address.pincode}
                    </p>
                    <p className="text-xs text-muted-foreground">{address.country}</p>
                    {isDefault && <Badge className="mt-2">Default</Badge>}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    {!isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDefault.mutate(address.id)}
                        disabled={setDefault.isPending}
                        title="Set as default"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Dialog
                      open={editingId === address.id}
                      onOpenChange={(open) => !open && setEditingId(null)}
                    >
                      <DialogTrigger
                        render={
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(address.id)}>
                            Edit
                          </Button>
                        }
                      />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Address</DialogTitle>
                          <DialogDescription>Update your address details</DialogDescription>
                        </DialogHeader>
                        {editingAddress && (
                          <AddressForm
                            initial={editingAddress}
                            onSubmit={handleUpdateAddress}
                            isSubmitting={update.isPending}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove.mutate(address.id)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No addresses yet</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => setOpenNewForm(true)}>
              Add Your First Address
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
