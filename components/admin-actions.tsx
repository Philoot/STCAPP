"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, Award } from "lucide-react"

interface AdminActionsProps {
  installation: any
}

export function AdminActions({ installation }: AdminActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState(installation.notes || "")

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("installations")
        .update({
          status: newStatus,
          notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", installation.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
        <CardDescription>Review and update installation status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-notes">Admin Notes</Label>
          <Textarea
            id="admin-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this installation..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          {installation.status === "submitted" && (
            <Button
              onClick={() => updateStatus("under_review")}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Clock className="mr-2 h-4 w-4" />
              Move to Review
            </Button>
          )}

          {(installation.status === "submitted" || installation.status === "under_review") && (
            <>
              <Button onClick={() => updateStatus("approved")} disabled={isLoading} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Installation
              </Button>

              <Button
                onClick={() => updateStatus("rejected")}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Installation
              </Button>
            </>
          )}

          {installation.status === "approved" && (
            <Button onClick={() => updateStatus("credits_claimed")} disabled={isLoading} className="w-full">
              <Award className="mr-2 h-4 w-4" />
              Mark Credits Claimed
            </Button>
          )}
        </div>

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>Created: {new Date(installation.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(installation.updated_at).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
