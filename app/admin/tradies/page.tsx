import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Building2, FileText, UserPlus } from "lucide-react"

export default async function TradiesManagement() {
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

  // Get all tradies with their installation counts
  const { data: tradies } = await supabase
    .from("profiles")
    .select(
      `
      *,
      installations(count)
    `,
    )
    .eq("role", "tradie")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tradies Management</h1>
            <p className="text-sm text-muted-foreground">View and manage registered tradies</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/tradies/invite">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Tradie
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Registered Tradies ({tradies?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {tradies && tradies.length > 0 ? (
              <div className="space-y-4">
                {tradies.map((tradie: any) => (
                  <Card key={tradie.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{tradie.full_name}</h3>
                            <Badge variant="secondary">Tradie</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{tradie.email}</p>
                              </div>
                            </div>
                            {tradie.company_name && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">Company</p>
                                  <p className="font-medium">{tradie.company_name}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-muted-foreground">Installations</p>
                                <p className="font-medium">{tradie.installations?.[0]?.count || 0}</p>
                              </div>
                            </div>
                          </div>
                          {tradie.license_number && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground">
                                License: <span className="font-medium">{tradie.license_number}</span>
                              </p>
                            </div>
                          )}
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              Registered: {new Date(tradie.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">No tradies registered yet</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
