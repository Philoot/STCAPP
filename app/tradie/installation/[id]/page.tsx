import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PanelCaptureForm } from "@/components/panel-capture-form"

export default async function InstallationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get installation details
  const { data: installation, error } = await supabase
    .from("installations")
    .select("*")
    .eq("id", id)
    .eq("tradie_id", user.id)
    .single()

  if (error || !installation) {
    redirect("/tradie")
  }

  // Get panels for this installation
  const { data: panels } = await supabase
    .from("panels")
    .select("*")
    .eq("installation_id", id)
    .order("created_at", { ascending: false })

  const { data: details } = await supabase
    .from("installation_details")
    .select("*")
    .eq("installation_id", id)
    .single()

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

  const canEdit = installation.status === "draft"
  const progress = installation.total_panels > 0 ? ((panels?.length || 0) / installation.total_panels) * 100 : 0

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—"
    if (Array.isArray(value)) return value.filter(Boolean).join(", ")
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  const renderRows = (record?: Record<string, unknown>) => {
    if (!record) return null
    return Object.entries(record).map(([key, value]) => (
      <div key={key} className="flex justify-between">
        <dt className="text-muted-foreground">{key.replace(/_/g, " ")}</dt>
        <dd className="font-medium text-right">{formatValue(value)}</dd>
      </div>
    ))
  }

  const renderLinkList = (value: unknown) => {
    if (!value) return <span className="text-muted-foreground">—</span>
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-col gap-1 text-right">
          {value.map((entry, index) =>
            typeof entry === "string" ? (
              <a
                key={`${entry}-${index}`}
                href={entry}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                {entry}
              </a>
            ) : (
              <span key={`${index}`} className="text-muted-foreground">
                —
              </span>
            ),
          )}
        </div>
      )
    }
    if (typeof value === "string") {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
          {value}
        </a>
      )
    }
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/tradie">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Badge className={getStatusColor(installation.status)}>{installation.status.replace("_", " ")}</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{installation.customer_name}</CardTitle>
              <CardDescription>{installation.site_address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">System Details</h3>
                  <dl className="space-y-1 text-sm">
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
                  </dl>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer Contact</h3>
                  <dl className="space-y-1 text-sm">
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
                  </dl>
                </div>
              </div>

              {installation.notes && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{installation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {details && (
            <Card>
              <CardHeader>
                <CardTitle>Installation Submission Details</CardTitle>
                <CardDescription>Installer, owner, equipment, and compliance metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-2">Installer</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.installer as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Installation</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.installation as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">PV Modules</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.pv as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Inverters</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.inverter as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Battery</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.battery as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Owner</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.owner as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Electrician</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.electrician as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Designer</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.designer as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Retailer</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.retailer as Record<string, unknown>)}</dl>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Accreditation</h3>
                    <dl className="space-y-2 text-sm">{renderRows(details.accreditation as Record<string, unknown>)}</dl>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Attachments</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Certificate of Electrical Safety</dt>
                      <dd className="font-medium text-right">
                        {renderLinkList((details.attachments as Record<string, unknown>)?.certificate_of_electrical_safety_url)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Proof of Attendance</dt>
                      <dd className="font-medium text-right">
                        {renderLinkList((details.attachments as Record<string, unknown>)?.proof_of_attendance_url)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">PV Serial Photos</dt>
                      <dd className="font-medium text-right">
                        {renderLinkList(
                          (details.attachments as Record<string, unknown>)?.pv_serial_number_photo_urls,
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Inverter Serial Photos</dt>
                      <dd className="font-medium text-right">
                        {renderLinkList(
                          (details.attachments as Record<string, unknown>)?.inverter_serial_number_photo_urls,
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Retailer Proof</dt>
                      <dd className="font-medium text-right">
                        {renderLinkList((details.attachments as Record<string, unknown>)?.retailer_proof_of_no_use_url)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Panel Capture Progress</CardTitle>
                  <CardDescription>
                    {panels?.length || 0} of {installation.total_panels} panels captured
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-secondary rounded-full h-2 mb-4">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>

              {canEdit && (
                <div className="mb-6">
                  <PanelCaptureForm installationId={id} />
                </div>
              )}

              {panels && panels.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Captured Panels</h3>
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
                </div>
              )}

              {canEdit && progress === 100 && (
                <div className="mt-6">
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/tradie/installation/${id}/assign-credits`}>Continue to Assign Credits</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
