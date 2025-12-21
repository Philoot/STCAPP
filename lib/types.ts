export type UserRole = "tradie" | "admin"

export type InstallationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "credits_claimed"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  company_name: string | null
  abn: string | null
  electrical_license: string | null
  created_at: string
  updated_at: string
}

export interface Installation {
  id: string
  tradie_id: string
  site_address: string
  site_suburb: string | null
  site_state: string | null
  site_postcode: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  installation_date: string
  system_size_kw: number
  total_panels: number
  status: InstallationStatus
  credits_assigned: boolean
  assignment_date: string | null
  signature_data: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Panel {
  id: string
  installation_id: string
  serial_number: string
  manufacturer: string | null
  model: string | null
  wattage: number | null
  serial_image_url: string | null
  installation_image_url: string | null
  verified: boolean
  created_at: string
}

export interface ComplianceDocument {
  id: string
  installation_id: string
  document_type: "stc_form" | "assignment_form" | "compliance_report" | "other"
  document_url: string | null
  generated_at: string
  generated_by: string | null
}
