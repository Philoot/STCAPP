"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PanelCaptureFormProps {
  installationId: string
}

export function PanelCaptureForm({ installationId }: PanelCaptureFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serialImage, setSerialImage] = useState<File | null>(null)
  const [installImage, setInstallImage] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      // Upload images to Supabase Storage
      let serialImageUrl = null
      let installImageUrl = null

      if (serialImage) {
        const fileName = `${installationId}/${Date.now()}_serial_${serialImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("panel-images")
          .upload(fileName, serialImage)

        if (uploadError) throw uploadError
        const {
          data: { publicUrl },
        } = supabase.storage.from("panel-images").getPublicUrl(fileName)
        serialImageUrl = publicUrl
      }

      if (installImage) {
        const fileName = `${installationId}/${Date.now()}_install_${installImage.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("panel-images")
          .upload(fileName, installImage)

        if (uploadError) throw uploadError
        const {
          data: { publicUrl },
        } = supabase.storage.from("panel-images").getPublicUrl(fileName)
        installImageUrl = publicUrl
      }

      // Insert panel record
      const { error: insertError } = await supabase.from("panels").insert({
        installation_id: installationId,
        serial_number: formData.get("serial_number") as string,
        manufacturer: formData.get("manufacturer") as string,
        model: formData.get("model") as string,
        wattage: formData.get("wattage") ? Number.parseInt(formData.get("wattage") as string) : null,
        serial_image_url: serialImageUrl,
        installation_image_url: installImageUrl,
      })

      if (insertError)
        throw insertError

        // Reset form
      ;(e.target as HTMLFormElement).reset()
      setSerialImage(null)
      setInstallImage(null)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Add Panel
        </CardTitle>
        <CardDescription>Capture panel serial number and installation photos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input id="serial_number" name="serial_number" required placeholder="ABC123456789" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" name="manufacturer" placeholder="e.g., Canadian Solar" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" placeholder="e.g., CS3W-400P" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wattage">Wattage (W)</Label>
              <Input id="wattage" name="wattage" type="number" placeholder="e.g., 400" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="serial_image">Serial Number Photo *</Label>
              <Input
                id="serial_image"
                type="file"
                accept="image/*"
                capture="environment"
                required
                onChange={(e) => setSerialImage(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Clear photo of panel serial number</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="install_image">Installation Photo *</Label>
              <Input
                id="install_image"
                type="file"
                accept="image/*"
                capture="environment"
                required
                onChange={(e) => setInstallImage(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Photo of installed panel</p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Panel...
              </>
            ) : (
              "Add Panel"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
