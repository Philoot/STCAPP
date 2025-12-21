import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, FileText, Camera, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">STC Credits</h1>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 text-balance">Solar STC Credits Management for Australian Tradies</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            same day payment for STC assignements to 123STC for compliant applications
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Tradie Login</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card>
            <CardHeader>
              <Camera className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Capture On-Site</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Use your mobile device to photograph panel serial numbers and installations directly from the job site
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Assign Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Digital signature process for tradies to assign STC credit rights with full legal compliance
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>We Handle Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our team completes all paperwork and submissions to the Clean Energy Regulator on your behalf
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Claim Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your installations from capture to approved credits with full transparency and reporting
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create Installation</h3>
                <p className="text-sm text-muted-foreground">
                  Add customer details and system information in our mobile-friendly app
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Capture Panel Data</h3>
                <p className="text-sm text-muted-foreground">
                  Photograph each panel serial number and installation with your phone camera
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sign Assignment</h3>
                <p className="text-sm text-muted-foreground">Digitally sign to assign your STC credit rights to us</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">We Do the Rest</h3>
                <p className="text-sm text-muted-foreground">
                  Our compliance team handles all regulator paperwork and claims your credits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>STC Credits Management Platform - Streamlining solar compliance for Australian electrical tradies</p>
        </div>
      </footer>
    </div>
  )
}
