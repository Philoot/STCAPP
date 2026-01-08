"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, PlusCircle } from "lucide-react"
import Link from "next/link"

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
]

const POSTAGE_TYPES = [
  { value: "physical", label: "Physical" },
  { value: "postal", label: "Postal" },
]

const OWNER_POSTAGE_TYPES = [
  { value: "same_installation", label: "Same As Installation" },
  { value: "physical", label: "Different Physical" },
  { value: "postal", label: "Postal" },
]

const GRID_CONNECTION_TYPES = [
  { value: "connected_with_battery", label: "Connected With Battery" },
  { value: "connected_without_battery", label: "Connected Without Battery" },
  { value: "standalone", label: "Stand-Alone" },
]

const ADDRESS_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "school", label: "School" },
]

const ADDRESS_FLOOR_TYPES = [
  { value: "single_story", label: "Single Story" },
  { value: "multi_story", label: "Multi Story" },
]

const SGU_TYPES = [
  { value: "solar", label: "Solar" },
  { value: "wind", label: "Wind" },
  { value: "hydro", label: "Hydro" },
]

const INSTALLATION_MOUNTING_TYPES = [
  { value: "building", label: "Building" },
  { value: "free_standing", label: "Free-Standing" },
]

const INSTALLATION_TYPES = [
  { value: "new", label: "New" },
  { value: "replacement", label: "Replacement" },
  { value: "extension", label: "Extension" },
  { value: "additional", label: "Additional" },
]

const DEEMING_PERIODS = [
  { value: "one", label: "One" },
  { value: "five", label: "Five" },
  { value: "single_maximum", label: "Single Maximum" },
]

const UNIT_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "unit", label: "Unit" },
  { value: "suite", label: "Suite" },
]

const STREET_TYPES = [
  { value: "street", label: "Street" },
  { value: "road", label: "Road" },
  { value: "drive", label: "Drive" },
  { value: "lane", label: "Lane" },
]

const DELIVERY_TYPES = [
  { value: "gpo", label: "GPO" },
  { value: "roadside", label: "Roadside" },
  { value: "po_box", label: "PO Box" },
]

const COUNTRIES = [
  { value: "Australia", label: "Australia" },
  { value: "New Zealand", label: "New Zealand" },
  { value: "United Kingdom", label: "United Kingdom" },
]

const OWNER_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "corporate_body", label: "Corporate Body" },
  { value: "government_body_trustee", label: "Government Body/Trustee" },
]

export default function NewInstallationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [installerPostageType, setInstallerPostageType] = useState("physical")
  const [ownerPostageType, setOwnerPostageType] = useState("same_installation")
  const [electricianSameAsInstaller, setElectricianSameAsInstaller] = useState("yes")
  const [electricianPostageType, setElectricianPostageType] = useState("physical")
  const [designerSameAsInstaller, setDesignerSameAsInstaller] = useState("yes")
  const [designerPostageType, setDesignerPostageType] = useState("physical")
  const [gridConnectionType, setGridConnectionType] = useState("connected_without_battery")
  const [installationType, setInstallationType] = useState("new")
  const [previousCerFailure, setPreviousCerFailure] = useState("no")
  const [pvMultipleBrands, setPvMultipleBrands] = useState("no")
  const [inverterMultipleBrands, setInverterMultipleBrands] = useState("no")
  const [batteryMultipleBrands, setBatteryMultipleBrands] = useState("no")
  const [solarRetailerStatus, setSolarRetailerStatus] = useState("yes")

  const [pvBrandCount, setPvBrandCount] = useState(1)
  const [inverterBrandCount, setInverterBrandCount] = useState(1)
  const [batteryBrandCount, setBatteryBrandCount] = useState(1)

  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null)
  const [pvSerialPhotoFiles, setPvSerialPhotoFiles] = useState<File[]>([])
  const [inverterSerialPhotoFiles, setInverterSerialPhotoFiles] = useState<File[]>([])
  const [retailerProofFile, setRetailerProofFile] = useState<File | null>(null)

  const pvIndexes = useMemo(() => Array.from({ length: pvBrandCount }, (_, i) => i), [pvBrandCount])
  const inverterIndexes = useMemo(
    () => Array.from({ length: inverterBrandCount }, (_, i) => i),
    [inverterBrandCount],
  )
  const batteryIndexes = useMemo(
    () => Array.from({ length: batteryBrandCount }, (_, i) => i),
    [batteryBrandCount],
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const getText = (key: string) => {
      const value = formData.get(key)
      if (typeof value !== "string") return null
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }

    const getNumber = (key: string) => {
      const value = getText(key)
      if (!value) return null
      const parsed = Number.parseFloat(value)
      return Number.isNaN(parsed) ? null : parsed
    }

    const getBoolean = (key: string) => {
      const value = getText(key)
      if (!value) return null
      return value === "yes"
    }

    const parseSerials = (value: string | null) => {
      if (!value) return []
      return value
        .split(",")
        .map((serial) => serial.trim())
        .filter(Boolean)
    }

    const uploadFile = async (file: File, prefix: string, installationId: string) => {
      const fileName = `${installationId}/${Date.now()}_${prefix}_${file.name}`
      const { error: uploadError } = await supabase.storage.from("installation-files").upload(fileName, file)
      if (uploadError) throw uploadError
      const {
        data: { publicUrl },
      } = supabase.storage.from("installation-files").getPublicUrl(fileName)
      return publicUrl
    }

    const uploadFiles = async (files: File[], prefix: string, installationId: string) => {
      const uploaded: string[] = []
      for (const file of files) {
        const url = await uploadFile(file, prefix, installationId)
        uploaded.push(url)
      }
      return uploaded
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const ownerFirstName = getText("owner_first_name")
      const ownerSurname = getText("owner_surname")
      const customerName = [ownerFirstName, ownerSurname].filter(Boolean).join(" ") || "Unknown"

      const siteAddressLine = [
        getText("installation_address_unit_number") && getText("installation_address_unit_type")
          ? `${getText("installation_address_unit_type")} ${getText("installation_address_unit_number")}`
          : null,
        [
          getText("installation_address_street_number"),
          getText("installation_address_street_name"),
          getText("installation_address_street_type"),
        ]
          .filter(Boolean)
          .join(" "),
      ]
        .filter(Boolean)
        .join(", ")

      const totalPanelsInput = getNumber("total_panels")
      const pvPanelTotals = pvIndexes
        .map((index) => getNumber(`pv_panel_number_${index}`) || 0)
        .reduce((sum, value) => sum + value, 0)
      const totalPanels = totalPanelsInput ?? (pvPanelTotals > 0 ? pvPanelTotals : 0)

      const systemSizeKw = getNumber("system_size_kw") || 0
      const installationDate = getText("installation_date") || new Date().toISOString().slice(0, 10)

      const { data: installation, error: installError } = await supabase
        .from("installations")
        .insert({
          tradie_id: user.id,
          customer_name: customerName,
          customer_email: getText("owner_email"),
          customer_phone: getText("owner_phone_number"),
          site_address: siteAddressLine || getText("installation_address_name") || "",
          site_suburb: getText("installation_address_suburb"),
          site_state: getText("installation_address_state"),
          site_postcode: getText("installation_address_postcode"),
          installation_date: installationDate,
          system_size_kw: systemSizeKw,
          total_panels: totalPanels,
          notes: getText("installation_location_details"),
          status: "draft",
        })
        .select()
        .single()

      if (installError) throw installError

      const installationId = installation.id

      const certificateUrl = certificateFile
        ? await uploadFile(certificateFile, "certificate", installationId)
        : null
      const attendanceUrl = attendanceFile ? await uploadFile(attendanceFile, "attendance", installationId) : null
      const pvSerialPhotoUrls = pvSerialPhotoFiles.length
        ? await uploadFiles(pvSerialPhotoFiles, "pv_serial", installationId)
        : []
      const inverterSerialPhotoUrls = inverterSerialPhotoFiles.length
        ? await uploadFiles(inverterSerialPhotoFiles, "inverter_serial", installationId)
        : []
      const retailerProofUrl = retailerProofFile
        ? await uploadFile(retailerProofFile, "retailer_proof", installationId)
        : null

      const installer = {
        first_name: getText("installer_first_name"),
        surname: getText("installer_surname"),
        phone_number: getText("installer_phone_number"),
        fax: getText("installer_fax"),
        mobile_number: getText("installer_mobile_number"),
        email: getText("installer_email"),
        cec: getText("installer_cec"),
        postage_type: getText("installer_postage_type"),
        physical: {
          unit_type: getText("installer_unit_type"),
          unit_number: getText("installer_unit_number"),
          street_number: getText("installer_street_number"),
          street_name: getText("installer_street_name"),
          street_type: getText("installer_street_type"),
          suburb: getText("installer_suburb"),
          state: getText("installer_state"),
          postcode: getText("installer_postcode"),
          country: getText("installer_country"),
        },
        postal: {
          delivery_type: getText("installer_postal_delivery_type"),
          delivery_number: getText("installer_postal_delivery_number"),
          suburb: getText("installer_postal_suburb"),
          state: getText("installer_postal_state"),
          postcode: getText("installer_postal_postcode"),
          country: getText("installer_postal_country"),
        },
      }

      const installationDetails = {
        sgu_type: getText("installation_sgu_type"),
        address_type: getText("installation_address_type"),
        address_floor: getText("installation_address_floor"),
        address_name: getText("installation_address_name"),
        unit_type: getText("installation_address_unit_type"),
        unit_number: getText("installation_address_unit_number"),
        street_number: getText("installation_address_street_number"),
        street_name: getText("installation_address_street_name"),
        street_type: getText("installation_address_street_type"),
        suburb: getText("installation_address_suburb"),
        state: getText("installation_address_state"),
        postcode: getText("installation_address_postcode"),
        latitude: getText("installation_address_latitude"),
        longitude: getText("installation_address_longitude"),
        multiple_sgu: getBoolean("installation_multiple_sgu"),
        nmi: getText("installation_nmi"),
        date: installationDate,
        mounting_type: getText("installation_mounting_type"),
        complete_unit_status: getBoolean("installation_complete_unit_status"),
        rate_power_output: getText("installation_rate_power_output"),
        deeming_period: getText("installation_deeming_period"),
        grid_connection_type: getText("installation_grid_connection_type"),
        type: getText("installation_type"),
        location_details: getText("installation_location_details"),
        previous_cer_failure: getBoolean("installation_previous_cer_failure"),
        previous_accreditation_code: getText("installation_previous_accreditation_code"),
        explanation_for_resubmission: getText("installation_explanation_for_resubmission"),
        certificate_of_electrical_safety_url: certificateUrl,
        proof_of_attendance_url: attendanceUrl,
      }

      const pvModules = pvIndexes
        .map((index) => ({
          brand: getText(`pv_module_brand_${index}`),
          model: getText(`pv_module_model_${index}`),
          panel_number: getNumber(`pv_panel_number_${index}`),
          serial_numbers: parseSerials(getText(`pv_serial_numbers_${index}`)),
        }))
        .filter((entry) => entry.brand || entry.model || entry.panel_number || entry.serial_numbers.length)

      const pv = {
        multiple_brands: getBoolean("installation_pv_multiple_brands"),
        modules: pvModules,
        serial_number_photo_urls: pvSerialPhotoUrls,
      }

      const inverterItems = inverterIndexes
        .map((index) => ({
          manufacturer: getText(`inverter_manufacturer_${index}`),
          series: getText(`inverter_series_${index}`),
          model_number: getText(`inverter_model_number_${index}`),
          number: getNumber(`inverter_number_${index}`),
          serial_numbers: parseSerials(getText(`inverter_serial_numbers_${index}`)),
        }))
        .filter(
          (entry) =>
            entry.manufacturer || entry.series || entry.model_number || entry.number || entry.serial_numbers.length,
        )

      const inverter = {
        multiple_brands: getBoolean("installation_inverter_multiple_brands"),
        inverters: inverterItems,
        serial_number_photo_urls: inverterSerialPhotoUrls,
      }

      const batteryItems = batteryIndexes
        .map((index) => ({
          manufacturer: getText(`battery_manufacturer_${index}`),
          model: getText(`battery_model_${index}`),
        }))
        .filter((entry) => entry.manufacturer || entry.model)

      const battery = {
        enabled: ["connected_with_battery", "standalone"].includes(getText("installation_grid_connection_type") || ""),
        multiple_brands: getBoolean("installation_battery_multiple_brands"),
        batteries: batteryItems,
        aggregated_system_status: getBoolean("installation_aggregated_system_status"),
        default_settings_status: getBoolean("installation_default_settings_status"),
      }

      const owner = {
        type: getText("owner_type"),
        first_name: ownerFirstName,
        surname: ownerSurname,
        phone_number: getText("owner_phone_number"),
        fax: getText("owner_fax"),
        mobile_number: getText("owner_mobile_number"),
        email: getText("owner_email"),
        postage_type: getText("owner_postage_type"),
        physical: {
          unit_type: getText("owner_unit_type"),
          unit_number: getText("owner_unit_number"),
          street_number: getText("owner_street_number"),
          street_name: getText("owner_street_name"),
          suburb: getText("owner_suburb"),
          state: getText("owner_state"),
          postcode: getText("owner_postcode"),
          country: getText("owner_country"),
        },
        postal: {
          delivery_type: getText("owner_postal_delivery_type"),
          delivery_number: getText("owner_postal_delivery_number"),
          suburb: getText("owner_postal_suburb"),
          state: getText("owner_postal_state"),
          postcode: getText("owner_postal_postcode"),
          country: getText("owner_postal_country"),
        },
      }

      const electrician = {
        same_as_installer: getBoolean("electrician_same_as_installer"),
        len: getText("electrician_len"),
        first_name: getText("electrician_first_name"),
        surname: getText("electrician_surname"),
        phone_number: getText("electrician_phone_number"),
        fax: getText("electrician_fax"),
        mobile_number: getText("electrician_mobile_number"),
        email: getText("electrician_email"),
        postage_type: getText("electrician_postage_type"),
        physical: {
          unit_type: getText("electrician_unit_type"),
          unit_number: getText("electrician_unit_number"),
          street_number: getText("electrician_street_number"),
          street_name: getText("electrician_street_name"),
          suburb: getText("electrician_suburb"),
          state: getText("electrician_state"),
          postcode: getText("electrician_postcode"),
          country: getText("electrician_country"),
        },
        postal: {
          delivery_type: getText("electrician_postal_delivery_type"),
          delivery_number: getText("electrician_postal_delivery_number"),
          suburb: getText("electrician_postal_suburb"),
          state: getText("electrician_postal_state"),
          postcode: getText("electrician_postal_postcode"),
          country: getText("electrician_postal_country"),
        },
      }

      const designer = {
        same_as_installer: getBoolean("designer_same_as_installer"),
        cec: getText("designer_cec"),
        first_name: getText("designer_first_name"),
        surname: getText("designer_surname"),
        phone_number: getText("designer_phone_number"),
        fax: getText("designer_fax"),
        mobile_number: getText("designer_mobile_number"),
        email: getText("designer_email"),
        postage_type: getText("designer_postage_type"),
        physical: {
          unit_type: getText("designer_unit_type"),
          unit_number: getText("designer_unit_number"),
          street_number: getText("designer_street_number"),
          street_name: getText("designer_street_name"),
          suburb: getText("designer_suburb"),
          state: getText("designer_state"),
          postcode: getText("designer_postcode"),
          country: getText("designer_country"),
        },
        postal: {
          delivery_type: getText("designer_postal_delivery_type"),
          delivery_number: getText("designer_postal_delivery_number"),
          suburb: getText("designer_postal_suburb"),
          state: getText("designer_postal_state"),
          postcode: getText("designer_postal_postcode"),
          country: getText("designer_postal_country"),
        },
      }

      const retailer = {
        status: getBoolean("solar_retailer_status"),
        name: getText("solar_retailer_name"),
        abn: getText("solar_retailer_abn"),
        representative_first_name: getText("solar_retailer_representative_first_name"),
        representative_surname: getText("solar_retailer_representative_surname"),
        representative_role: getText("solar_retailer_representative_role"),
        representative_signature: getText("solar_retailer_representative_signature"),
        proof_of_no_use_url: retailerProofUrl,
      }

      const accreditation = {
        designer_classification_scheme: getText("designer_accreditation_classification_scheme"),
        designer_accreditation_number: getText("designer_accreditation_number"),
        designer_signature: getText("designer_signature"),
        installer_classification_scheme: getText("installer_accreditation_classification_scheme"),
        installer_accreditation_number: getText("installer_accreditation_number"),
        installer_signature: getText("installer_signature"),
      }

      const attachments = {
        certificate_of_electrical_safety_url: certificateUrl,
        proof_of_attendance_url: attendanceUrl,
        pv_serial_number_photo_urls: pvSerialPhotoUrls,
        inverter_serial_number_photo_urls: inverterSerialPhotoUrls,
        retailer_proof_of_no_use_url: retailerProofUrl,
      }

      const { error: detailsError } = await supabase.from("installation_details").insert({
        installation_id: installationId,
        installer,
        installation: installationDetails,
        pv,
        inverter,
        battery,
        owner,
        electrician,
        designer,
        retailer,
        accreditation,
        attachments,
      })

      if (detailsError) throw detailsError

      router.push(`/tradie/installation/${installationId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/tradie">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Installer Details</CardTitle>
              <CardDescription>Primary installer contact and accreditation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="installer_first_name">First Name</Label>
                  <Input id="installer_first_name" name="installer_first_name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_surname">Surname</Label>
                  <Input id="installer_surname" name="installer_surname" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_phone_number">Phone Number</Label>
                  <Input id="installer_phone_number" name="installer_phone_number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_fax">Fax</Label>
                  <Input id="installer_fax" name="installer_fax" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_mobile_number">Mobile Number</Label>
                  <Input id="installer_mobile_number" name="installer_mobile_number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_email">Email</Label>
                  <Input id="installer_email" name="installer_email" type="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_cec">CEC Accreditation</Label>
                  <Input id="installer_cec" name="installer_cec" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_postage_type">Postage Type</Label>
                  <Select
                    name="installer_postage_type"
                    value={installerPostageType}
                    onValueChange={setInstallerPostageType}
                  >
                    <SelectTrigger id="installer_postage_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSTAGE_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {installerPostageType === "physical" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Physical Address</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="installer_unit_type">Unit Type</Label>
                      <Select name="installer_unit_type">
                        <SelectTrigger id="installer_unit_type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_TYPES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_unit_number">Unit Number</Label>
                      <Input id="installer_unit_number" name="installer_unit_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_street_number">Street Number</Label>
                      <Input id="installer_street_number" name="installer_street_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_street_name">Street Name</Label>
                      <Input id="installer_street_name" name="installer_street_name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_street_type">Street Type</Label>
                      <Select name="installer_street_type">
                        <SelectTrigger id="installer_street_type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {STREET_TYPES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_suburb">Suburb</Label>
                      <Input id="installer_suburb" name="installer_suburb" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_state">State</Label>
                      <Input id="installer_state" name="installer_state" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_postcode">Postcode</Label>
                      <Input id="installer_postcode" name="installer_postcode" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_country">Country</Label>
                      <Select name="installer_country">
                        <SelectTrigger id="installer_country">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {installerPostageType === "postal" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Postal Address</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="installer_postal_delivery_type">Delivery Type</Label>
                      <Select name="installer_postal_delivery_type">
                        <SelectTrigger id="installer_postal_delivery_type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_TYPES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_postal_delivery_number">Delivery Number</Label>
                      <Input id="installer_postal_delivery_number" name="installer_postal_delivery_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_postal_suburb">Suburb</Label>
                      <Input id="installer_postal_suburb" name="installer_postal_suburb" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_postal_state">State</Label>
                      <Input id="installer_postal_state" name="installer_postal_state" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_postal_postcode">Postcode</Label>
                      <Input id="installer_postal_postcode" name="installer_postal_postcode" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="installer_postal_country">Country</Label>
                      <Select name="installer_postal_country">
                        <SelectTrigger id="installer_postal_country">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Installation Address</CardTitle>
              <CardDescription>Site and SGU details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="installation_sgu_type">SGU Type</Label>
                  <Select name="installation_sgu_type">
                    <SelectTrigger id="installation_sgu_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {SGU_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_type">Address Type</Label>
                  <Select name="installation_address_type">
                    <SelectTrigger id="installation_address_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDRESS_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_floor">Address Floor</Label>
                  <Select name="installation_address_floor">
                    <SelectTrigger id="installation_address_floor">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDRESS_FLOOR_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_name">Address Name</Label>
                  <Input id="installation_address_name" name="installation_address_name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_unit_type">Unit Type</Label>
                  <Select name="installation_address_unit_type">
                    <SelectTrigger id="installation_address_unit_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_unit_number">Unit Number</Label>
                  <Input id="installation_address_unit_number" name="installation_address_unit_number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_street_number">Street Number</Label>
                  <Input id="installation_address_street_number" name="installation_address_street_number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_street_name">Street Name</Label>
                  <Input id="installation_address_street_name" name="installation_address_street_name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_street_type">Street Type</Label>
                  <Select name="installation_address_street_type">
                    <SelectTrigger id="installation_address_street_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {STREET_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_suburb">Suburb</Label>
                  <Input id="installation_address_suburb" name="installation_address_suburb" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_state">State</Label>
                  <Input id="installation_address_state" name="installation_address_state" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_postcode">Postcode</Label>
                  <Input id="installation_address_postcode" name="installation_address_postcode" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_latitude">Latitude (optional)</Label>
                  <Input id="installation_address_latitude" name="installation_address_latitude" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_address_longitude">Longitude (optional)</Label>
                  <Input id="installation_address_longitude" name="installation_address_longitude" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_multiple_sgu">Multiple SGU</Label>
                  <Select name="installation_multiple_sgu">
                    <SelectTrigger id="installation_multiple_sgu">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_nmi">NMI</Label>
                  <Input id="installation_nmi" name="installation_nmi" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Installation Details</CardTitle>
              <CardDescription>System performance and compliance data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="installation_date">Installation Date</Label>
                  <Input id="installation_date" name="installation_date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="system_size_kw">System Size (kW)</Label>
                  <Input id="system_size_kw" name="system_size_kw" type="number" step="0.01" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_rate_power_output">Rate/Power Output</Label>
                  <Input id="installation_rate_power_output" name="installation_rate_power_output" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_panels">Total Panels</Label>
                  <Input id="total_panels" name="total_panels" type="number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_mounting_type">Mounting Type</Label>
                  <Select name="installation_mounting_type">
                    <SelectTrigger id="installation_mounting_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTALLATION_MOUNTING_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_complete_unit_status">Complete Unit Status</Label>
                  <Select name="installation_complete_unit_status">
                    <SelectTrigger id="installation_complete_unit_status">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_deeming_period">Deeming Period</Label>
                  <Select name="installation_deeming_period">
                    <SelectTrigger id="installation_deeming_period">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEEMING_PERIODS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_grid_connection_type">Grid Connection Type</Label>
                  <Select
                    name="installation_grid_connection_type"
                    value={gridConnectionType}
                    onValueChange={setGridConnectionType}
                  >
                    <SelectTrigger id="installation_grid_connection_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRID_CONNECTION_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_type">Installation Type</Label>
                  <Select name="installation_type" value={installationType} onValueChange={setInstallationType}>
                    <SelectTrigger id="installation_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSTALLATION_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {installationType !== "new" && (
                <div className="grid gap-2">
                  <Label htmlFor="installation_location_details">Location Details</Label>
                  <Textarea id="installation_location_details" name="installation_location_details" rows={3} />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="installation_previous_cer_failure">Previous CER Failure</Label>
                  <Select
                    name="installation_previous_cer_failure"
                    value={previousCerFailure}
                    onValueChange={setPreviousCerFailure}
                  >
                    <SelectTrigger id="installation_previous_cer_failure">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {previousCerFailure === "yes" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="installation_previous_accreditation_code">Previous Accreditation Code</Label>
                      <Input
                        id="installation_previous_accreditation_code"
                        name="installation_previous_accreditation_code"
                      />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="installation_explanation_for_resubmission">Explanation for Resubmission</Label>
                      <Textarea
                        id="installation_explanation_for_resubmission"
                        name="installation_explanation_for_resubmission"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="installation_certificate">Certificate Of Electrical Safety (PDF)</Label>
                  <Input
                    id="installation_certificate"
                    name="installation_certificate"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_attendance">Proof Of Attendance (Image)</Label>
                  <Input
                    id="installation_attendance"
                    name="installation_attendance"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAttendanceFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>PV Modules</CardTitle>
              <CardDescription>Panel brand, model, and serial details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="installation_pv_multiple_brands">Multiple PV Brands</Label>
                <Select
                  name="installation_pv_multiple_brands"
                  value={pvMultipleBrands}
                  onValueChange={(value) => {
                    setPvMultipleBrands(value)
                    if (value === "no") setPvBrandCount(1)
                  }}
                >
                  <SelectTrigger id="installation_pv_multiple_brands">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {pvIndexes.map((index) => (
                <div key={`pv-${index}`} className="space-y-4 border rounded-md p-4">
                  <h3 className="text-sm font-semibold">PV Module Set {index + 1}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`pv_module_brand_${index}`}>Brand</Label>
                      <Input id={`pv_module_brand_${index}`} name={`pv_module_brand_${index}`} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`pv_module_model_${index}`}>Model</Label>
                      <Input id={`pv_module_model_${index}`} name={`pv_module_model_${index}`} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`pv_panel_number_${index}`}>Panel Number</Label>
                      <Input id={`pv_panel_number_${index}`} name={`pv_panel_number_${index}`} type="number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`pv_serial_numbers_${index}`}>Serial Numbers (comma-separated)</Label>
                      <Textarea id={`pv_serial_numbers_${index}`} name={`pv_serial_numbers_${index}`} rows={3} />
                    </div>
                  </div>
                </div>
              ))}

              {pvMultipleBrands === "yes" && (
                <Button type="button" variant="outline" onClick={() => setPvBrandCount((count) => count + 1)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add PV Brand
                </Button>
              )}

              <div className="grid gap-2">
                <Label htmlFor="pv_serial_number_photos">PV Serial Number Photos</Label>
                <Input
                  id="pv_serial_number_photos"
                  name="pv_serial_number_photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPvSerialPhotoFiles(Array.from(e.target.files || []))}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Inverter Details</CardTitle>
              <CardDescription>Inverter brand, model, and serial details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="installation_inverter_multiple_brands">Multiple Inverter Brands</Label>
                <Select
                  name="installation_inverter_multiple_brands"
                  value={inverterMultipleBrands}
                  onValueChange={(value) => {
                    setInverterMultipleBrands(value)
                    if (value === "no") setInverterBrandCount(1)
                  }}
                >
                  <SelectTrigger id="installation_inverter_multiple_brands">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {YES_NO.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {inverterIndexes.map((index) => (
                <div key={`inverter-${index}`} className="space-y-4 border rounded-md p-4">
                  <h3 className="text-sm font-semibold">Inverter Set {index + 1}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`inverter_manufacturer_${index}`}>Manufacturer</Label>
                      <Input id={`inverter_manufacturer_${index}`} name={`inverter_manufacturer_${index}`} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`inverter_series_${index}`}>Series</Label>
                      <Input id={`inverter_series_${index}`} name={`inverter_series_${index}`} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`inverter_model_number_${index}`}>Model Number</Label>
                      <Input id={`inverter_model_number_${index}`} name={`inverter_model_number_${index}`} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`inverter_number_${index}`}>Number</Label>
                      <Input id={`inverter_number_${index}`} name={`inverter_number_${index}`} type="number" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor={`inverter_serial_numbers_${index}`}>Serial Numbers (comma-separated)</Label>
                      <Textarea
                        id={`inverter_serial_numbers_${index}`}
                        name={`inverter_serial_numbers_${index}`}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {inverterMultipleBrands === "yes" && (
                <Button type="button" variant="outline" onClick={() => setInverterBrandCount((count) => count + 1)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Inverter Brand
                </Button>
              )}

              <div className="grid gap-2">
                <Label htmlFor="inverter_serial_number_photos">Inverter Serial Number Photos</Label>
                <Input
                  id="inverter_serial_number_photos"
                  name="inverter_serial_number_photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setInverterSerialPhotoFiles(Array.from(e.target.files || []))}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Battery Details</CardTitle>
              <CardDescription>Only required for standalone or battery-connected systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="installation_battery_multiple_brands">Multiple Battery Brands</Label>
                  <Select
                    name="installation_battery_multiple_brands"
                    value={batteryMultipleBrands}
                    onValueChange={(value) => {
                      setBatteryMultipleBrands(value)
                      if (value === "no") setBatteryBrandCount(1)
                    }}
                  >
                    <SelectTrigger id="installation_battery_multiple_brands">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_aggregated_system_status">Aggregated System Status</Label>
                  <Select name="installation_aggregated_system_status">
                    <SelectTrigger id="installation_aggregated_system_status">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installation_default_settings_status">Default Settings Status</Label>
                  <Select name="installation_default_settings_status">
                    <SelectTrigger id="installation_default_settings_status">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {batteryIndexes.map((index) => (
                <div key={`battery-${index}`} className="space-y-4 border rounded-md p-4">
                  <h3 className="text-sm font-semibold">Battery Set {index + 1}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`battery_manufacturer_${index}`}>Manufacturer</Label>
                      <Input id={`battery_manufacturer_${index}`} name={`battery_manufacturer_${index}`} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`battery_model_${index}`}>Model</Label>
                      <Input id={`battery_model_${index}`} name={`battery_model_${index}`} />
                    </div>
                  </div>
                </div>
              ))}

              {batteryMultipleBrands === "yes" && (
                <Button type="button" variant="outline" onClick={() => setBatteryBrandCount((count) => count + 1)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Battery Brand
                </Button>
              )}

              {!["connected_with_battery", "standalone"].includes(gridConnectionType) && (
                <p className="text-sm text-muted-foreground">
                  Battery details are only required for standalone or battery-connected systems.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Owner Details</CardTitle>
              <CardDescription>System owner or customer contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="owner_type">Owner Type</Label>
                  <Select name="owner_type">
                    <SelectTrigger id="owner_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {OWNER_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner_first_name">First Name</Label>
                  <Input id="owner_first_name" name="owner_first_name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner_surname">Surname</Label>
                  <Input id="owner_surname" name="owner_surname" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner_phone_number">Phone Number</Label>
                  <Input id="owner_phone_number" name="owner_phone_number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner_fax">Fax</Label>
                  <Input id="owner_fax" name="owner_fax" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner_mobile_number">Mobile Number</Label>
                  <Input id="owner_mobile_number" name="owner_mobile_number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner_email">Email</Label>
                  <Input id="owner_email" name="owner_email" type="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="owner_postage_type">Postage Type</Label>
                  <Select name="owner_postage_type" value={ownerPostageType} onValueChange={setOwnerPostageType}>
                    <SelectTrigger id="owner_postage_type">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {OWNER_POSTAGE_TYPES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {ownerPostageType === "physical" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Owner Physical Address</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="owner_unit_type">Unit Type</Label>
                      <Select name="owner_unit_type">
                        <SelectTrigger id="owner_unit_type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_TYPES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_unit_number">Unit Number</Label>
                      <Input id="owner_unit_number" name="owner_unit_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_street_number">Street Number</Label>
                      <Input id="owner_street_number" name="owner_street_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_street_name">Street Name</Label>
                      <Input id="owner_street_name" name="owner_street_name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_suburb">Suburb</Label>
                      <Input id="owner_suburb" name="owner_suburb" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_state">State</Label>
                      <Input id="owner_state" name="owner_state" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_postcode">Postcode</Label>
                      <Input id="owner_postcode" name="owner_postcode" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_country">Country</Label>
                      <Select name="owner_country">
                        <SelectTrigger id="owner_country">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {ownerPostageType === "postal" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Owner Postal Address</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="owner_postal_delivery_type">Delivery Type</Label>
                      <Select name="owner_postal_delivery_type">
                        <SelectTrigger id="owner_postal_delivery_type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_TYPES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_postal_delivery_number">Delivery Number</Label>
                      <Input id="owner_postal_delivery_number" name="owner_postal_delivery_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_postal_suburb">Suburb</Label>
                      <Input id="owner_postal_suburb" name="owner_postal_suburb" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_postal_state">State</Label>
                      <Input id="owner_postal_state" name="owner_postal_state" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_postal_postcode">Postcode</Label>
                      <Input id="owner_postal_postcode" name="owner_postal_postcode" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="owner_postal_country">Country</Label>
                      <Select name="owner_postal_country">
                        <SelectTrigger id="owner_postal_country">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Electrician Details</CardTitle>
              <CardDescription>Required if different from installer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="electrician_same_as_installer">Same As Installer</Label>
                  <Select
                    name="electrician_same_as_installer"
                    value={electricianSameAsInstaller}
                    onValueChange={setElectricianSameAsInstaller}
                  >
                    <SelectTrigger id="electrician_same_as_installer">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="electrician_len">LEN</Label>
                  <Input id="electrician_len" name="electrician_len" />
                </div>
              </div>

              {electricianSameAsInstaller === "no" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="electrician_first_name">First Name</Label>
                      <Input id="electrician_first_name" name="electrician_first_name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="electrician_surname">Surname</Label>
                      <Input id="electrician_surname" name="electrician_surname" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="electrician_phone_number">Phone Number</Label>
                      <Input id="electrician_phone_number" name="electrician_phone_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="electrician_fax">Fax</Label>
                      <Input id="electrician_fax" name="electrician_fax" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="electrician_mobile_number">Mobile Number</Label>
                      <Input id="electrician_mobile_number" name="electrician_mobile_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="electrician_email">Email</Label>
                      <Input id="electrician_email" name="electrician_email" type="email" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="electrician_postage_type">Postage Type</Label>
                      <Select
                        name="electrician_postage_type"
                        value={electricianPostageType}
                        onValueChange={setElectricianPostageType}
                      >
                        <SelectTrigger id="electrician_postage_type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSTAGE_TYPES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {electricianPostageType === "physical" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_unit_type">Unit Type</Label>
                        <Select name="electrician_unit_type">
                          <SelectTrigger id="electrician_unit_type">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_TYPES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_unit_number">Unit Number</Label>
                        <Input id="electrician_unit_number" name="electrician_unit_number" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_street_number">Street Number</Label>
                        <Input id="electrician_street_number" name="electrician_street_number" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_street_name">Street Name</Label>
                        <Input id="electrician_street_name" name="electrician_street_name" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_suburb">Suburb</Label>
                        <Input id="electrician_suburb" name="electrician_suburb" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_state">State</Label>
                        <Input id="electrician_state" name="electrician_state" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_postcode">Postcode</Label>
                        <Input id="electrician_postcode" name="electrician_postcode" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_country">Country</Label>
                        <Select name="electrician_country">
                          <SelectTrigger id="electrician_country">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {electricianPostageType === "postal" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_postal_delivery_type">Delivery Type</Label>
                        <Select name="electrician_postal_delivery_type">
                          <SelectTrigger id="electrician_postal_delivery_type">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {DELIVERY_TYPES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_postal_delivery_number">Delivery Number</Label>
                        <Input id="electrician_postal_delivery_number" name="electrician_postal_delivery_number" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_postal_suburb">Suburb</Label>
                        <Input id="electrician_postal_suburb" name="electrician_postal_suburb" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_postal_state">State</Label>
                        <Input id="electrician_postal_state" name="electrician_postal_state" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_postal_postcode">Postcode</Label>
                        <Input id="electrician_postal_postcode" name="electrician_postal_postcode" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="electrician_postal_country">Country</Label>
                        <Select name="electrician_postal_country">
                          <SelectTrigger id="electrician_postal_country">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Designer Details</CardTitle>
              <CardDescription>Required if different from installer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="designer_same_as_installer">Same As Installer</Label>
                  <Select
                    name="designer_same_as_installer"
                    value={designerSameAsInstaller}
                    onValueChange={setDesignerSameAsInstaller}
                  >
                    <SelectTrigger id="designer_same_as_installer">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="designer_cec">Designer CEC</Label>
                  <Input id="designer_cec" name="designer_cec" />
                </div>
              </div>

              {designerSameAsInstaller === "no" && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="designer_first_name">First Name</Label>
                      <Input id="designer_first_name" name="designer_first_name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="designer_surname">Surname</Label>
                      <Input id="designer_surname" name="designer_surname" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="designer_phone_number">Phone Number</Label>
                      <Input id="designer_phone_number" name="designer_phone_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="designer_fax">Fax</Label>
                      <Input id="designer_fax" name="designer_fax" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="designer_mobile_number">Mobile Number</Label>
                      <Input id="designer_mobile_number" name="designer_mobile_number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="designer_email">Email</Label>
                      <Input id="designer_email" name="designer_email" type="email" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="designer_postage_type">Postage Type</Label>
                      <Select
                        name="designer_postage_type"
                        value={designerPostageType}
                        onValueChange={setDesignerPostageType}
                      >
                        <SelectTrigger id="designer_postage_type">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSTAGE_TYPES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {designerPostageType === "physical" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="designer_unit_type">Unit Type</Label>
                        <Select name="designer_unit_type">
                          <SelectTrigger id="designer_unit_type">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_TYPES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_unit_number">Unit Number</Label>
                        <Input id="designer_unit_number" name="designer_unit_number" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_street_number">Street Number</Label>
                        <Input id="designer_street_number" name="designer_street_number" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_street_name">Street Name</Label>
                        <Input id="designer_street_name" name="designer_street_name" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_suburb">Suburb</Label>
                        <Input id="designer_suburb" name="designer_suburb" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_state">State</Label>
                        <Input id="designer_state" name="designer_state" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_postcode">Postcode</Label>
                        <Input id="designer_postcode" name="designer_postcode" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_country">Country</Label>
                        <Select name="designer_country">
                          <SelectTrigger id="designer_country">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {designerPostageType === "postal" && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="designer_postal_delivery_type">Delivery Type</Label>
                        <Select name="designer_postal_delivery_type">
                          <SelectTrigger id="designer_postal_delivery_type">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {DELIVERY_TYPES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_postal_delivery_number">Delivery Number</Label>
                        <Input id="designer_postal_delivery_number" name="designer_postal_delivery_number" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_postal_suburb">Suburb</Label>
                        <Input id="designer_postal_suburb" name="designer_postal_suburb" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_postal_state">State</Label>
                        <Input id="designer_postal_state" name="designer_postal_state" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_postal_postcode">Postcode</Label>
                        <Input id="designer_postal_postcode" name="designer_postal_postcode" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="designer_postal_country">Country</Label>
                        <Select name="designer_postal_country">
                          <SelectTrigger id="designer_postal_country">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Solar Retailer Details</CardTitle>
              <CardDescription>Retailer details or proof of no use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="solar_retailer_status">Solar Retailer Used</Label>
                  <Select
                    name="solar_retailer_status"
                    value={solarRetailerStatus}
                    onValueChange={setSolarRetailerStatus}
                  >
                    <SelectTrigger id="solar_retailer_status">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {solarRetailerStatus === "yes" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="solar_retailer_name">Retailer Name</Label>
                    <Input id="solar_retailer_name" name="solar_retailer_name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="solar_retailer_abn">Retailer ABN</Label>
                    <Input id="solar_retailer_abn" name="solar_retailer_abn" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="solar_retailer_representative_first_name">Rep First Name</Label>
                    <Input
                      id="solar_retailer_representative_first_name"
                      name="solar_retailer_representative_first_name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="solar_retailer_representative_surname">Rep Surname</Label>
                    <Input
                      id="solar_retailer_representative_surname"
                      name="solar_retailer_representative_surname"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="solar_retailer_representative_role">Rep Role</Label>
                    <Input id="solar_retailer_representative_role" name="solar_retailer_representative_role" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="solar_retailer_representative_signature">Rep Signature</Label>
                    <Input
                      id="solar_retailer_representative_signature"
                      name="solar_retailer_representative_signature"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="solar_retailer_proof">Proof Of No Use (optional)</Label>
                  <Input
                    id="solar_retailer_proof"
                    name="solar_retailer_proof"
                    type="file"
                    onChange={(e) => setRetailerProofFile(e.target.files?.[0] || null)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Accreditation & Signatures</CardTitle>
              <CardDescription>Installer and designer accreditation data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="installer_accreditation_classification_scheme">Installer Accreditation Scheme</Label>
                  <Input
                    id="installer_accreditation_classification_scheme"
                    name="installer_accreditation_classification_scheme"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_accreditation_number">Installer Accreditation Number</Label>
                  <Input id="installer_accreditation_number" name="installer_accreditation_number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installer_signature">Installer Signature</Label>
                  <Input id="installer_signature" name="installer_signature" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="designer_accreditation_classification_scheme">Designer Accreditation Scheme</Label>
                  <Input
                    id="designer_accreditation_classification_scheme"
                    name="designer_accreditation_classification_scheme"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="designer_accreditation_number">Designer Accreditation Number</Label>
                  <Input id="designer_accreditation_number" name="designer_accreditation_number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="designer_signature">Designer Signature</Label>
                  <Input id="designer_signature" name="designer_signature" />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Installation..." : "Create Installation"}
          </Button>
        </form>
      </main>
    </div>
  )
}
