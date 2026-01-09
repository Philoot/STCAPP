import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { serial_numbers } = await request.json()

    if (!Array.isArray(serial_numbers) || serial_numbers.length === 0) {
      return NextResponse.json({ error: "Serial numbers array is required" }, { status: 400 })
    }

    // In a production environment, this would call the actual REC Registry API
    // For now, we'll simulate the verification process
    const verificationResults = await Promise.all(
      serial_numbers.map(async (serialNumber: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Basic validation: check format
        const isValidFormat = /^[A-Z0-9]{10,20}$/i.test(serialNumber)

        // In production, you would:
        // 1. Call REC Registry API to check if serial number exists
        // 2. Verify it hasn't been claimed before
        // 3. Check manufacturer and model against CEC approved list

        const mockRecRegistryCheck = {
          serial_number: serialNumber,
          exists_in_registry: isValidFormat,
          already_claimed: Math.random() > 0.95, // 5% chance already claimed
          manufacturer: isValidFormat ? "Sample Manufacturer" : null,
          model: isValidFormat ? "Sample Model" : null,
          cec_approved: isValidFormat,
          wattage: isValidFormat ? 400 : null,
        }

        return mockRecRegistryCheck
      }),
    )

    // Check for any issues
    const duplicates = verificationResults.filter((r) => r.already_claimed)
    const invalid = verificationResults.filter((r) => !r.exists_in_registry)
    const notCecApproved = verificationResults.filter((r) => !r.cec_approved)

    return NextResponse.json({
      success: true,
      results: verificationResults,
      summary: {
        total: serial_numbers.length,
        valid: verificationResults.filter((r) => r.exists_in_registry && !r.already_claimed && r.cec_approved).length,
        duplicates: duplicates.length,
        invalid: invalid.length,
        not_cec_approved: notCecApproved.length,
      },
      issues: {
        duplicates: duplicates.map((r) => r.serial_number),
        invalid: invalid.map((r) => r.serial_number),
        not_cec_approved: notCecApproved.map((r) => r.serial_number),
      },
    })
  } catch (error) {
    console.error("[v0] Error verifying panel serials:", error)
    return NextResponse.json({ error: "Failed to verify panel serial numbers" }, { status: 500 })
  }
}
