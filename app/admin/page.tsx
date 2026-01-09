import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Users, CheckCircle, Clock, Plus } from "lucide-react"

export default async function AdminDashboard() {
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

  // Get all installations
  const { data: installations } = await supabase
    .from("installations")
    .select(
      `
      *,
      profiles!installations_tradie_id_fkey(full_name, company_name, email),
      panels(count)
    `,
    )
    .order("created_at", { ascending: false })

  // Get statistics
  const { count: totalInstallations } = await supabase.from("installations").select("*", { count: "exact", head: true })

  const { count: submittedCount } = await supabase
    .from("installations")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted")

  const { count: approvedCount } = await supabase
    .from("installations")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const { count: claimedCount } = await supabase
    .from("installations")
    .select("*", { count: "exact", head: true })
    .eq("status", "credits_claimed")

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

  const pendingInstallations = installations?.filter((i) => i.status === "submitted") || []
  const reviewInstallations = installations?.filter((i) => i.status === "under_review") || []
  const completedInstallations =
    installations?.filter((i) => i.status === "approved" || i.status === "credits_claimed") || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">STC Credits Admin</h1>
            <p className="text-sm text-muted-foreground">Compliance Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/tradies">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Tradies
              </Button>
            </Link>
            <Link href="/admin/new-installation">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Installation
              </Button>
            </Link>
            <form
              action={async () => {
                "use server"
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect("/auth/login")
              }}
            >
              <Button type="submit" variant="outline">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Installations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInstallations || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submittedCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Claimed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claimedCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingInstallations.length})</TabsTrigger>
            <TabsTrigger value="review">Under Review ({reviewInstallations.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedInstallations.length})</TabsTrigger>
            <TabsTrigger value="all">All ({installations?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingInstallations.length > 0 ? (
              <div className="grid gap-4">
                {pendingInstallations.map((installation: any) => (
                  <Link key={installation.id} href={`/admin/installation/${installation.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{installation.customer_name}</h3>
                              <Badge className={getStatusColor(installation.status)}>
                                {installation.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{installation.site_address}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Tradie</p>
                                <p className="font-medium">{installation.profiles?.full_name || "Unknown"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">System Size</p>
                                <p className="font-medium">{installation.system_size_kw} kW</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Panels</p>
                                <p className="font-medium">
                                  {installation.panels?.[0]?.count || 0}/{installation.total_panels}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Submitted</p>
                                <p className="font-medium">{new Date(installation.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No pending installations</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {reviewInstallations.length > 0 ? (
              <div className="grid gap-4">
                {reviewInstallations.map((installation: any) => (
                  <Link key={installation.id} href={`/admin/installation/${installation.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{installation.customer_name}</h3>
                              <Badge className={getStatusColor(installation.status)}>
                                {installation.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{installation.site_address}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Tradie</p>
                                <p className="font-medium">{installation.profiles?.full_name || "Unknown"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">System Size</p>
                                <p className="font-medium">{installation.system_size_kw} kW</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Panels</p>
                                <p className="font-medium">
                                  {installation.panels?.[0]?.count || 0}/{installation.total_panels}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{new Date(installation.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No installations under review</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedInstallations.length > 0 ? (
              <div className="grid gap-4">
                {completedInstallations.map((installation: any) => (
                  <Link key={installation.id} href={`/admin/installation/${installation.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{installation.customer_name}</h3>
                              <Badge className={getStatusColor(installation.status)}>
                                {installation.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{installation.site_address}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Tradie</p>
                                <p className="font-medium">{installation.profiles?.full_name || "Unknown"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">System Size</p>
                                <p className="font-medium">{installation.system_size_kw} kW</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Panels</p>
                                <p className="font-medium">
                                  {installation.panels?.[0]?.count || 0}/{installation.total_panels}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{new Date(installation.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No completed installations</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {installations && installations.length > 0 ? (
              <div className="grid gap-4">
                {installations.map((installation: any) => (
                  <Link key={installation.id} href={`/admin/installation/${installation.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{installation.customer_name}</h3>
                              <Badge className={getStatusColor(installation.status)}>
                                {installation.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{installation.site_address}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Tradie</p>
                                <p className="font-medium">{installation.profiles?.full_name || "Unknown"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">System Size</p>
                                <p className="font-medium">{installation.system_size_kw} kW</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Panels</p>
                                <p className="font-medium">
                                  {installation.panels?.[0]?.count || 0}/{installation.total_panels}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{new Date(installation.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No installations</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
