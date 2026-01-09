"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText, Download, Plus } from "lucide-react"

interface ComplianceDocumentsProps {
  installationId: string
  documents: any[]
}

export function ComplianceDocuments({ installationId, documents }: ComplianceDocumentsProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [docType, setDocType] = useState<string>("stc_form")

  const generateDocument = async () => {
    setIsGenerating(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // In a real implementation, this would generate a PDF or document
      // For now, we'll just create a record
      const { error } = await supabase.from("compliance_documents").insert({
        installation_id: installationId,
        document_type: docType,
        generated_by: user?.id,
        document_url: `/documents/${installationId}/${docType}_${Date.now()}.pdf`,
      })

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error generating document:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Compliance Documents
        </CardTitle>
        <CardDescription>Generate and manage compliance paperwork</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="doc-type">Document Type</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger id="doc-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stc_form">STC Application Form</SelectItem>
              <SelectItem value="assignment_form">Credit Assignment Form</SelectItem>
              <SelectItem value="compliance_report">Compliance Report</SelectItem>
              <SelectItem value="other">Other Document</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateDocument} disabled={isGenerating} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Document"}
        </Button>

        {documents.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-sm">Generated Documents</h4>
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{doc.document_type.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(doc.generated_at).toLocaleString()}</p>
                </div>
                {doc.document_url && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={doc.document_url} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
