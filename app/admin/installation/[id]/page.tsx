import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AdminActions } from "@/components/admin-actions"
import { ComplianceDocuments } from "@/components/compliance-documents"

export default async function AdminInstallationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/tradie")

  // Get installation details with tradie info
  const { data: installation, error } = await supabase
    .from("installations")
    .select(
      `
      *,
      profiles!installations_tradie_id_fkey(full_name, company_name, email, phone, electrical_license, abn)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !installation) {
    redirect("/admin")
  }

  // Get panels for this installation
  const { data: panels } = await supabase
    .from("panels")
    .select("*")
    .eq("installation_id", id)
    .order("created_at", { ascending: false })

  // Get compliance documents
  const { data: documents } = await supabase
    .from("compliance_documents")
    .select("*")
    .eq("installation_id", id)
    .order("generated_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500"
      case "submitted":
        return "bg-blue-500"
      case "under_review":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "credits_claimed":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Badge className={getStatusColor(installation.status)}>{installation.status.replace("_", " ")}</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{installation.customer_name}</CardTitle>
                <CardDescription>{installation.site_address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-3">System Details</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">System Size:</dt>
                        <dd className="font-medium">{installation.system_size_kw} kW</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Total Panels:</dt>
                        <dd className="font-medium">{installation.total_panels}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Installation Date:</dt>
                        <dd className="font-medium">{new Date(installation.installation_date).toLocaleDateString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Credits Assigned:</dt>
                        <dd className="font-medium">{installation.credits_assigned ? "Yes" : "No"}</dd>
                      </div>
                      {installation.assignment_date && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Assignment Date:</dt>
                          <dd className="font-medium">{new Date(installation.assignment_date).toLocaleDateString()}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Customer Contact</h3>
                    <dl className="space-y-2 text-sm">
                      {installation.customer_email && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Email:</dt>
                          <dd className="font-medium">{installation.customer_email}</dd>
                        </div>
                      )}
                      {installation.customer_phone && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Phone:</dt>
                          <dd className="font-medium">{installation.customer_phone}</dd>
                        </div>
                      )}
                      {installation.site_suburb && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Suburb:</dt>
                          <dd className="font-medium">{installation.site_suburb}</dd>
                        </div>
                      )}
                      {installation.site_state && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">State:</dt>
                          <dd className="font-medium">{installation.site_state}</dd>
                        </div>
                      )}
                      {installation.site_postcode && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Postcode:</dt>
                          <dd className="font-medium">{installation.site_postcode}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {installation.notes && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{installation.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tradie Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground mb-1">Name</dt>
                    <dd className="font-medium">{installation.profiles?.full_name || "Unknown"}</dd>
                  </div>
                  {installation.profiles?.company_name && (
                    <div>
                      <dt className="text-muted-foreground mb-1">Company</dt>
                      <dd className="font-medium">{installation.profiles.company_name}</dd>
                    </div>
                  )}
                  {installation.profiles?.email && (
                    <div>
                      <dt className="text-muted-foreground mb-1">Email</dt>
                      <dd className="font-medium">{installation.profiles.email}</dd>
                    </div>
                  )}
                  {installation.profiles?.phone && (
                    <div>
                      <dt className="text-muted-foreground mb-1">Phone</dt>
                      <dd className="font-medium">{installation.profiles.phone}</dd>
                    </div>
                  )}
                  {installation.profiles?.electrical_license && (
                    <div>
                      <dt className="text-muted-foreground mb-1">Electrical License</dt>
                      <dd className="font-medium">{installation.profiles.electrical_license}</dd>
                    </div>
                  )}
                  {installation.profiles?.abn && (
                    <div>
                      <dt className="text-muted-foreground mb-1">ABN</dt>
                      <dd className="font-medium">{installation.profiles.abn}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Panel Inventory ({panels?.length || 0} panels)</CardTitle>
                <CardDescription>All captured panel serial numbers and images for this installation</CardDescription>
              </CardHeader>
              <CardContent>
                {panels && panels.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {panels.map((panel: any) => (
                      <Card key={panel.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{panel.serial_number}</p>
                                {panel.manufacturer && (
                                  <p className="text-sm text-muted-foreground">{panel.manufacturer}</p>
                                )}
                              </div>
                              {panel.verified && <Badge variant="outline">Verified</Badge>}
                            </div>
                            {panel.model && (
                              <p className="text-sm">
                                Model: <span className="font-medium">{panel.model}</span>
                              </p>
                            )}
                            {panel.wattage && (
                              <p className="text-sm">
                                Wattage: <span className="font-medium">{panel.wattage}W</span>
                              </p>
                            )}
                            <div className="flex gap-2 pt-2">
                              {panel.serial_image_url && (
                                <a
                                  href={panel.serial_image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  View Serial
                                </a>
                              )}
                              {panel.installation_image_url && (
                                <a
                                  href={panel.installation_image_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  View Install
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No panels captured yet</p>
                )}
              </CardContent>
            </Card>

            <ComplianceDocuments installationId={id} documents={documents || []} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <AdminActions installation={installation} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
