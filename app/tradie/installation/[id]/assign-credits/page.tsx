import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SignatureCanvas } from "@/components/signature-canvas"

export default async function AssignCreditsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get installation details
  const { data: installation } = await supabase
    .from("installations")
    .select("*, profiles!installations_tradie_id_fkey(*)")
    .eq("id", id)
    .single()

  if (!installation || installation.tradie_id !== user.id) {
    redirect("/tradie")
  }

  // Check if credits already assigned
  if (installation.credits_assigned) {
    redirect(`/tradie/installation/${id}`)
  }

  // Get panels count
  const { count: panelsCount } = await supabase
    .from("panels")
    .select("*", { count: "exact", head: true })
    .eq("installation_id", id)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href={`/tradie/installation/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Installation
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Assign STC Credits</CardTitle>
            <CardDescription>
              Sign to assign your Small-scale Technology Certificate credits to us for processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">Installation Summary</h3>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Customer:</dt>
                  <dd className="font-medium">{installation.customer_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">System Size:</dt>
                  <dd className="font-medium">{installation.system_size_kw} kW</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total Panels:</dt>
                  <dd className="font-medium">{installation.total_panels}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Panels Captured:</dt>
                  <dd className="font-medium">{panelsCount || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Installation Date:</dt>
                  <dd className="font-medium">{new Date(installation.installation_date).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Credit Assignment Agreement</h3>
              <div className="space-y-3 text-sm leading-relaxed p-4 border rounded-lg max-h-64 overflow-y-auto">
                <p className="font-medium">Small-scale Technology Certificate (STC) Assignment Agreement</p>

                <p>
                  I, {installation.profiles?.full_name},
                  {installation.profiles?.company_name && ` trading as ${installation.profiles.company_name},`}
                  {installation.profiles?.abn && ` ABN ${installation.profiles.abn},`}
                  {installation.profiles?.electrical_license && ` License ${installation.profiles.electrical_license},`}
                  hereby assign all rights, title, and interest in the Small-scale Technology Certificates (STCs)
                  created from the solar panel installation at {installation.site_address} to STC Credits Management
                  Platform.
                </p>

                <p className="font-medium mt-4">Terms of Assignment:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    I confirm that I have installed {installation.total_panels} solar panels with a total system size of{" "}
                    {installation.system_size_kw} kW at the above address on{" "}
                    {new Date(installation.installation_date).toLocaleDateString()}.
                  </li>
                  <li>
                    I confirm that all equipment installed meets the eligibility requirements for STC creation under the
                    Small-scale Renewable Energy Scheme.
                  </li>
                  <li>
                    I assign all rights to create and claim STCs from this installation to STC Credits Management
                    Platform.
                  </li>
                  <li>
                    I authorize STC Credits Management Platform to submit applications to the Clean Energy Regulator on
                    my behalf for this installation.
                  </li>
                  <li>
                    I confirm that I have not previously assigned these rights to any other party and that the
                    installation complies with all relevant Australian standards and regulations.
                  </li>
                  <li>
                    I understand that STC Credits Management Platform will handle all compliance paperwork and
                    submissions to the Clean Energy Regulator.
                  </li>
                  <li>I acknowledge that payment terms and STC valuation have been separately agreed upon.</li>
                </ul>

                <p className="font-medium mt-4">Warranties and Representations:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The installation was completed by a licensed electrical contractor.</li>
                  <li>All panels are new and have not been previously installed.</li>
                  <li>The installation meets all relevant safety and building standards.</li>
                  <li>All information provided is true and accurate to the best of my knowledge.</li>
                </ul>

                <p className="mt-4 text-xs text-muted-foreground">
                  By signing below, I acknowledge that I have read, understood, and agree to the terms of this STC
                  Assignment Agreement. I understand that providing false or misleading information may result in
                  penalties under the Clean Energy Regulator's compliance framework.
                </p>
              </div>
            </div>

            <SignatureCanvas installationId={id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
