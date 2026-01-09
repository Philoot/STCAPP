"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewInstallationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("installations")
        .insert({
          tradie_id: user.id,
          customer_name: formData.get("customer_name") as string,
          customer_email: formData.get("customer_email") as string,
          customer_phone: formData.get("customer_phone") as string,
          site_address: formData.get("site_address") as string,
          site_suburb: formData.get("site_suburb") as string,
          site_state: formData.get("site_state") as string,
          site_postcode: formData.get("site_postcode") as string,
          installation_date: formData.get("installation_date") as string,
          system_size_kw: Number.parseFloat(formData.get("system_size_kw") as string),
          total_panels: Number.parseInt(formData.get("total_panels") as string),
          notes: formData.get("notes") as string,
          status: "draft",
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/tradie/installation/${data.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/tradie">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Installation</CardTitle>
            <CardDescription>Create a new solar installation to capture panel data</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer_name">Customer Name *</Label>
                    <Input id="customer_name" name="customer_name" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer_email">Customer Email</Label>
                    <Input id="customer_email" name="customer_email" type="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer_phone">Customer Phone</Label>
                    <Input id="customer_phone" name="customer_phone" type="tel" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Installation Site</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="site_address">Street Address *</Label>
                    <Input id="site_address" name="site_address" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="site_suburb">Suburb</Label>
                      <Input id="site_suburb" name="site_suburb" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="site_state">State</Label>
                      <Input id="site_state" name="site_state" placeholder="NSW" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="site_postcode">Postcode</Label>
                    <Input id="site_postcode" name="site_postcode" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Details</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="installation_date">Installation Date *</Label>
                    <Input id="installation_date" name="installation_date" type="date" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="system_size_kw">System Size (kW) *</Label>
                      <Input id="system_size_kw" name="system_size_kw" type="number" step="0.01" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="total_panels">Total Panels *</Label>
                      <Input id="total_panels" name="total_panels" type="number" required />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" rows={3} />
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Installation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
