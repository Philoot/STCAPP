"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PenTool, RotateCcw } from "lucide-react"

interface SignatureCanvasProps {
  installationId: string
}

export function SignatureCanvas({ installationId }: SignatureCanvasProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Set drawing styles
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasSignature(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSubmit = async () => {
    if (!hasSignature) {
      setError("Please provide your signature")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error("Canvas not found")

      // Convert canvas to blob
      const signatureDataUrl = canvas.toDataURL("image/png")

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // In a production app, you would upload the signature image to Supabase Storage
      // For now, we'll store the data URL directly (not recommended for production)

      // Create rights assignment record
      const { error: assignmentError } = await supabase.from("rights_assignments").insert({
        installation_id: installationId,
        tradie_id: user.id,
        signature_data: signatureDataUrl,
        agreed_to_terms: true,
        signed_at: new Date().toISOString(),
      })

      if (assignmentError) throw assignmentError

      // Update installation to mark credits as assigned
      const { error: updateError } = await supabase
        .from("installations")
        .update({
          credits_assigned: true,
          assignment_date: new Date().toISOString(),
          status: "submitted",
        })
        .eq("id", installationId)

      if (updateError) throw updateError

      router.push(`/tradie/installation/${installationId}`)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          Your Signature
        </Label>
        <div className="border-2 border-dashed rounded-lg p-1">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-40 bg-white rounded cursor-crosshair touch-none"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear Signature
        </Button>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={agreedToTerms}
          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
        />
        <label
          htmlFor="terms"
          className="text-sm leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the terms and conditions of this STC Assignment Agreement and confirm that all information provided
          is true and accurate.
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleSubmit} disabled={isSubmitting || !hasSignature || !agreedToTerms} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Assignment"}
      </Button>
    </div>
  )
}
