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
  // CER mandatory fields
  nmi: string | null
  system_mounting_type: SystemMountingType | null
  installation_type: InstallationType | null
  is_complete_unit: boolean
  deeming_period: number | null
  rated_power_output_kw: number | null
  connection_type: ConnectionType | null
  previous_system_failed: boolean
  previous_accreditation_code: string | null
  property_type: PropertyType | null
  is_multi_story: boolean | null
  latitude: number | null
  longitude: number | null
  additional_system_info: string | null
  retailer_id: string | null
  retailer_representative_id: string | null
  electrician_id: string | null
  designer_id: string | null
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
  cec_approved: boolean
  cec_module_brand: string | null
  cec_module_model: string | null
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

export type SystemMountingType = "building_or_structure" | "ground_mounted"
export type InstallationType = "new_system" | "replacement_system" | "extension_system" | "additional_system"
export type ConnectionType = "grid_without_battery" | "grid_with_battery" | "standalone"
export type PropertyType = "residential" | "commercial" | "industrial" | "agricultural"
export type OwnerType = "individual" | "company" | "trust" | "other"
export type StatementType =
  | "installer_details"
  | "performance_warranty"
  | "completion_and_generation"
  | "feed_in_tariff_info"
  | "conflict_of_interest"
  | "eligibility_declaration"

export type AuditType =
  | "panel_serial_verification"
  | "rec_registry_check"
  | "document_validation"
  | "retailer_verification"
  | "electrician_verification"

export type AuditStatus = "pending" | "passed" | "failed" | "warning"

export interface SolarRetailer {
  id: string
  legal_name: string
  abn: string
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface RetailerRepresentative {
  id: string
  retailer_id: string
  first_name: string
  last_name: string
  role: string
  email: string | null
  phone: string | null
  created_at: string
}

export interface Electrician {
  id: string
  first_name: string
  last_name: string
  license_number: string
  license_state: string
  phone: string | null
  email: string | null
  address: string | null
  suburb: string | null
  state: string | null
  postcode: string | null
  created_at: string
  updated_at: string
}

export interface Designer {
  id: string
  first_name: string
  last_name: string
  accreditation_number: string | null
  phone: string | null
  email: string | null
  address: string | null
  suburb: string | null
  state: string | null
  postcode: string | null
  created_at: string
  updated_at: string
}

export interface BatterySystem {
  id: string
  installation_id: string
  manufacturer: string
  model: string
  capacity_kwh: number | null
  is_aggregated_control: boolean | null
  installer_changed_settings: boolean | null
  serial_number: string | null
  created_at: string
}

export interface Inverter {
  id: string
  installation_id: string
  manufacturer: string
  series: string
  model_number: string
  serial_number: string
  capacity_kw: number | null
  created_at: string
}

export interface RetailerWrittenStatement {
  id: string
  installation_id: string
  retailer_id: string
  statement_type: StatementType
  statement_text: string
  signed_by: string
  signed_at: string
  is_verified: boolean
}

export interface OwnerDetails {
  id: string
  installation_id: string
  owner_type: OwnerType | null
  full_name: string
  company_name: string | null
  abn: string | null
  email: string
  phone: string
  postal_address: string
  postal_suburb: string
  postal_state: string
  postal_postcode: string
  created_at: string
}

export interface AuditLog {
  id: string
  installation_id: string
  audit_type: AuditType
  status: AuditStatus
  details: Record<string, any> | null
  performed_by: string | null
  performed_at: string
}
