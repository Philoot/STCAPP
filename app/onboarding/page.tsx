"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Building2, User, Shield, CreditCard, FileCheck } from "lucide-react"
import { SignaturePad } from "@/components/signature-pad"

type EntityType = "individual" | "company" | "trustee" | "partnership"
type TrusteeCapacity = "sole_trustee" | "corporate_trustee"
type AuthorizedPosition = "director" | "sole_trader" | "trustee" | "partner" | "agent"
type BankVerificationType = "bank_letter" | "voided_cheque" | "bank_statement"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Step 1: Entity Details
  const [legalEntityName, setLegalEntityName] = useState("")
  const [abn, setAbn] = useState("")
  const [entityType, setEntityType] = useState<EntityType>("individual")
  const [tradingName, setTradingName] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Step 2: Company Details (conditional)
  const [companyName, setCompanyName] = useState("")
  const [acn, setAcn] = useState("")
  const [directors, setDirectors] = useState("")

  // Step 3: Trust Details (conditional)
  const [trustName, setTrustName] = useState("")
  const [trusteeName, setTrusteeName] = useState("")
  const [trusteeCapacity, setTrusteeCapacity] = useState<TrusteeCapacity>("sole_trustee")

  // Step 4: Authorized Representative
  const [repName, setRepName] = useState("")
  const [repPosition, setRepPosition] = useState<AuthorizedPosition>("director")
  const [repEmail, setRepEmail] = useState("")
  const [repPhone, setRepPhone] = useState("")

  // Step 5: Bank Details
  const [bankAccountName, setBankAccountName] = useState("")
  const [bankBsb, setBankBsb] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankInstitution, setBankInstitution] = useState("")
  const [bankVerificationType, setBankVerificationType] = useState<BankVerificationType>("bank_statement")
  const [bankVerificationFile, setBankVerificationFile] = useState<File | null>(null)

  // Step 6: Declarations
  const [declarationAgreed, setDeclarationAgreed] = useState(false)
  const [signatureData, setSignatureData] = useState<string>("")

  const totalSteps = entityType === "company" || entityType === "trustee" ? 6 : 5
  const progress = (step / totalSteps) * 100

  const validateStep = () => {
    setError(null)

    if (step === 1) {
      if (!legalEntityName || !abn || !businessAddress || !email || !phone) {
        setError("Please fill in all required fields")
        return false
      }
    }

    if (step === 2 && entityType === "company") {
      if (!companyName || !acn || !directors) {
        setError("Please fill in all company details")
        return false
      }
    }

    if (step === 2 && entityType === "trustee") {
      if (!trustName || !trusteeName) {
        setError("Please fill in all trust details")
        return false
      }
    }

    if (step === 3 || (step === 2 && entityType !== "company" && entityType !== "trustee")) {
      if (!repName || !repPosition || !repEmail || !repPhone) {
        setError("Please fill in all authorized representative details")
        return false
      }
    }

    if (step === 4 || (step === 3 && entityType !== "company" && entityType !== "trustee")) {
      if (!bankAccountName || !bankBsb || !bankAccountNumber || !bankInstitution || !bankVerificationFile) {
        setError("Please fill in all bank details and upload verification")
        return false
      }
      // Validate BSB format (6 digits)
      if (!/^\d{6}$/.test(bankBsb.replace(/-/g, ""))) {
        setError("BSB must be 6 digits")
        return false
      }
    }

    if (step === totalSteps) {
      if (!declarationAgreed || !signatureData) {
        setError("Please agree to the declaration and provide your signature")
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError(null)
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Upload bank verification document
      let bankVerificationUrl = ""
      if (bankVerificationFile) {
        const fileExt = bankVerificationFile.name.split(".").pop()
        const fileName = `${user.id}/bank-verification.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, bankVerificationFile, { upsert: true })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("documents").getPublicUrl(fileName)

        bankVerificationUrl = publicUrl
      }

      // Update profile with onboarding data
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          legal_entity_name: legalEntityName,
          entity_type: entityType,
          trading_name: tradingName || null,
          business_address: businessAddress,
          phone: phone,
          abn: abn,
          company_name: entityType === "company" ? companyName : null,
          acn: entityType === "company" ? acn : null,
          directors: entityType === "company" ? directors.split(",").map((d) => d.trim()) : null,
          trust_name: entityType === "trustee" ? trustName : null,
          trustee_name: entityType === "trustee" ? trusteeName : null,
          trustee_capacity: entityType === "trustee" ? trusteeCapacity : null,
          authorized_rep_name: repName,
          authorized_rep_position: repPosition,
          authorized_rep_email: repEmail,
          authorized_rep_phone: repPhone,
          bank_account_name: bankAccountName,
          bank_bsb: bankBsb,
          bank_account_number: bankAccountNumber,
          bank_financial_institution: bankInstitution,
          bank_verification_document_url: bankVerificationUrl,
          bank_verification_type: bankVerificationType,
          declaration_agreed: declarationAgreed,
          declaration_signature_data: signatureData,
          declaration_signed_at: new Date().toISOString(),
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      // Redirect to appropriate dashboard based on role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/tradie")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete onboarding")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    // Step 1: Entity Details
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Entity Details</h3>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="legal-entity-name">Legal Name of Entity (as per ABR) *</Label>
            <Input
              id="legal-entity-name"
              value={legalEntityName}
              onChange={(e) => setLegalEntityName(e.target.value)}
              placeholder="Enter legal entity name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="abn">ABN *</Label>
            <Input
              id="abn"
              value={abn}
              onChange={(e) => setAbn(e.target.value)}
              placeholder="12 345 678 901"
              maxLength={14}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="entity-type">Entity Type *</Label>
            <Select value={entityType} onValueChange={(value) => setEntityType(value as EntityType)}>
              <SelectTrigger id="entity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual / Sole Trader</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="trustee">Trustee</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="trading-name">Trading Name (if any)</Label>
            <Input
              id="trading-name"
              value={tradingName}
              onChange={(e) => setTradingName(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="business-address">Registered / Principal Business Address *</Label>
            <Input
              id="business-address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="123 Main St, Sydney NSW 2000"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@business.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0412 345 678"
            />
          </div>
        </div>
      )
    }

    // Step 2: Company or Trust Details (conditional)
    if (step === 2 && entityType === "company") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Company Details</h3>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="ABC Pty Ltd"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="acn">ACN *</Label>
            <Input
              id="acn"
              value={acn}
              onChange={(e) => setAcn(e.target.value)}
              placeholder="123 456 789"
              maxLength={11}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="directors">Directors (comma separated) *</Label>
            <Input
              id="directors"
              value={directors}
              onChange={(e) => setDirectors(e.target.value)}
              placeholder="John Smith, Jane Doe"
            />
          </div>
        </div>
      )
    }

    if (step === 2 && entityType === "trustee") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Trust Details</h3>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="trust-name">Trust Name *</Label>
            <Input
              id="trust-name"
              value={trustName}
              onChange={(e) => setTrustName(e.target.value)}
              placeholder="The Smith Family Trust"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="trustee-name">Trustee Name *</Label>
            <Input
              id="trustee-name"
              value={trusteeName}
              onChange={(e) => setTrusteeName(e.target.value)}
              placeholder="John Smith"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="trustee-capacity">Capacity *</Label>
            <Select value={trusteeCapacity} onValueChange={(value) => setTrusteeCapacity(value as TrusteeCapacity)}>
              <SelectTrigger id="trustee-capacity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_trustee">Sole Trustee</SelectItem>
                <SelectItem value="corporate_trustee">Corporate Trustee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    // Step 3 (or 2 for individual/partnership): Authorized Representative
    const isRepStep = entityType === "company" || entityType === "trustee" ? step === 3 : step === 2
    if (isRepStep) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Authorized Representative</h3>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rep-name">Name *</Label>
            <Input
              id="rep-name"
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              placeholder="John Smith"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rep-position">Position / Capacity *</Label>
            <Select value={repPosition} onValueChange={(value) => setRepPosition(value as AuthorizedPosition)}>
              <SelectTrigger id="rep-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="director">Director</SelectItem>
                <SelectItem value="sole_trader">Sole Trader</SelectItem>
                <SelectItem value="trustee">Trustee</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rep-email">Email *</Label>
            <Input
              id="rep-email"
              type="email"
              value={repEmail}
              onChange={(e) => setRepEmail(e.target.value)}
              placeholder="rep@business.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rep-phone">Phone *</Label>
            <Input
              id="rep-phone"
              type="tel"
              value={repPhone}
              onChange={(e) => setRepPhone(e.target.value)}
              placeholder="0412 345 678"
            />
          </div>
        </div>
      )
    }

    // Step 4 (or 3 for individual/partnership): Bank Details
    const isBankStep = entityType === "company" || entityType === "trustee" ? step === 4 : step === 3
    if (isBankStep) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Bank Account Details</h3>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank-account-name">Account Name *</Label>
            <Input
              id="bank-account-name"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              placeholder="ABC Pty Ltd"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bank-bsb">BSB *</Label>
              <Input
                id="bank-bsb"
                value={bankBsb}
                onChange={(e) => setBankBsb(e.target.value)}
                placeholder="123-456"
                maxLength={7}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank-account-number">Account Number *</Label>
              <Input
                id="bank-account-number"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="12345678"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank-institution">Financial Institution *</Label>
            <Input
              id="bank-institution"
              value={bankInstitution}
              onChange={(e) => setBankInstitution(e.target.value)}
              placeholder="Commonwealth Bank"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank-verification-type">Bank Verification Type *</Label>
            <Select
              value={bankVerificationType}
              onValueChange={(value) => setBankVerificationType(value as BankVerificationType)}
            >
              <SelectTrigger id="bank-verification-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_letter">Bank Letter</SelectItem>
                <SelectItem value="voided_cheque">Voided Cheque</SelectItem>
                <SelectItem value="bank_statement">Bank Statement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank-verification-file">Upload Verification Document *</Label>
            <Input
              id="bank-verification-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setBankVerificationFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              Upload a bank letter, voided cheque, or bank statement (PDF, JPG, or PNG)
            </p>
          </div>
        </div>
      )
    }

    // Final Step: Declarations and Signature
    if (step === totalSteps) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Declaration and Signature</h3>
          </div>

          <div className="rounded-lg border p-4 bg-muted/50 space-y-3">
            <h4 className="font-medium">Declarations</h4>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>I declare that the information provided is true and correct</li>
              <li>I am authorised to act on behalf of this entity</li>
              <li>Payments made in reliance on these details discharge payment obligations</li>
              <li>I understand this information is used for STC credit processing</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="declaration"
              checked={declarationAgreed}
              onCheckedChange={(checked) => setDeclarationAgreed(checked as boolean)}
            />
            <label
              htmlFor="declaration"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the declarations above *
            </label>
          </div>

          <div className="grid gap-2">
            <Label>Signature *</Label>
            <SignaturePad onSave={(signature) => setSignatureData(signature)} className="border rounded-lg" />
            <p className="text-xs text-muted-foreground">Please sign above using your mouse or finger</p>
          </div>
        </div>
      )
    }

    return null
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        // Check if already completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, role")
          .eq("id", user.id)
          .single()

        if (profile?.onboarding_completed) {
          // Already completed, redirect to dashboard
          if (profile.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/tradie")
          }
        }
      } catch (err) {
        console.error("[v0] Auth check error:", err)
        router.push("/auth/login")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Onboarding</CardTitle>
            <CardDescription>
              Step {step} of {totalSteps} - We need some information to set up your account
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

            {renderStep()}

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleBack} disabled={step === 1 || isLoading}>
                Back
              </Button>

              {step < totalSteps ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Complete Onboarding"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
