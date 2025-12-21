import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-center">Verification Failed</CardTitle>
            <CardDescription className="text-center">There was an issue verifying your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The email verification link may have expired or is invalid. Please try signing up again or contact support
              if the issue persists.
            </p>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/auth/sign-up">Try Again</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
