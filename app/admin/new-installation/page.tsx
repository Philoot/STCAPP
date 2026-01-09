import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

export default async function NewInstallationAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/tradie")
  }

  // Get all tradies for the select dropdown
  const { data: tradies } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, email")
    .eq("role", "tradie")
    .order("full_name")

  async function createInstallation(formData: FormData) {
    "use server"
    const supabase = await createClient()

    const tradieId = formData.get("tradie_id") as string
    const customerName = formData.get("customer_name") as string
    const siteAddress = formData.get("site_address") as string
    const systemSizeKw = Number.parseFloat(formData.get("system_size_kw") as string)
    const totalPanels = Number.parseInt(formData.get("total_panels") as string)
    const installationDate = formData.get("installation_date") as string

    const { data, error } = await supabase
      .from("installations")
      .insert({
        tradie_id: tradieId,
        customer_name: customerName,
        site_address: siteAddress,
        system_size_kw: systemSizeKw,
        total_panels: totalPanels,
        installation_date: installationDate,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating installation:", error)
      return
    }

    redirect(`/admin/installation/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">New Installation</h1>
            <p className="text-sm text-muted-foreground">Create a new installation record</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Installation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createInstallation} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tradie_id">
                  Assigned Tradie <span className="text-destructive">*</span>
                </Label>
                <Select name="tradie_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tradie" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradies?.map((tradie) => (
                      <SelectItem key={tradie.id} value={tradie.id}>
                        {tradie.full_name} {tradie.company_name && `(${tradie.company_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_name">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input id="customer_name" name="customer_name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_address">
                  Installation Site Address <span className="text-destructive">*</span>
                </Label>
                <Input id="site_address" name="site_address" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="system_size_kw">
                    System Size (kW) <span className="text-destructive">*</span>
                  </Label>
                  <Input id="system_size_kw" name="system_size_kw" type="number" step="0.01" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_panels">
                    Total Panels <span className="text-destructive">*</span>
                  </Label>
                  <Input id="total_panels" name="total_panels" type="number" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="installation_date">
                  Installation Date <span className="text-destructive">*</span>
                </Label>
                <Input id="installation_date" name="installation_date" type="date" required />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Create Installation
                </Button>
                <Link href="/admin" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
