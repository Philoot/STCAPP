import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"

export default async function TradieDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user installations
  const { data: installations } = await supabase
    .from("installations")
    .select("*, panels(count)")
    .eq("tradie_id", user.id)
    .order("created_at", { ascending: false })

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
          <div>
            <h1 className="text-2xl font-bold">STC Credits</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name}</p>
          </div>
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
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">My Installations</h2>
          <Button asChild>
            <Link href="/tradie/new-installation">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Installation
            </Link>
          </Button>
        </div>

        {installations && installations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {installations.map((installation: any) => (
              <Link key={installation.id} href={`/tradie/installation/${installation.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{installation.customer_name}</CardTitle>
                        <CardDescription className="text-sm">{installation.site_address}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(installation.status)}>
                        {installation.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">System Size:</span>
                        <span className="font-medium">{installation.system_size_kw} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Panels:</span>
                        <span className="font-medium">{installation.total_panels}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Captured:</span>
                        <span className="font-medium">{installation.panels?.[0]?.count || 0} panels</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {new Date(installation.installation_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No installations yet</p>
              <Button asChild>
                <Link href="/tradie/new-installation">Create Your First Installation</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
