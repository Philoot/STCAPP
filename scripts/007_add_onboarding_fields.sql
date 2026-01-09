-- Add comprehensive onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS legal_entity_name TEXT,
ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN ('individual', 'company', 'trustee', 'partnership')),
ADD COLUMN IF NOT EXISTS trading_name TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS acn TEXT,
ADD COLUMN IF NOT EXISTS directors TEXT[],
ADD COLUMN IF NOT EXISTS trust_name TEXT,
ADD COLUMN IF NOT EXISTS trustee_name TEXT,
ADD COLUMN IF NOT EXISTS trustee_capacity TEXT CHECK (trustee_capacity IN ('sole_trustee', 'corporate_trustee')),
ADD COLUMN IF NOT EXISTS authorized_rep_name TEXT,
ADD COLUMN IF NOT EXISTS authorized_rep_position TEXT CHECK (authorized_rep_position IN ('director', 'sole_trader', 'trustee', 'partner', 'agent')),
ADD COLUMN IF NOT EXISTS authorized_rep_email TEXT,
ADD COLUMN IF NOT EXISTS authorized_rep_phone TEXT,
ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
ADD COLUMN IF NOT EXISTS bank_bsb TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_financial_institution TEXT,
ADD COLUMN IF NOT EXISTS bank_verification_document_url TEXT,
ADD COLUMN IF NOT EXISTS bank_verification_type TEXT CHECK (bank_verification_type IN ('bank_letter', 'voided_cheque', 'bank_statement')),
ADD COLUMN IF NOT EXISTS declaration_agreed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS declaration_signature_data TEXT,
ADD COLUMN IF NOT EXISTS declaration_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comment to explain the schema
COMMENT ON TABLE public.profiles IS 'User profiles with comprehensive KYC/onboarding data for AML compliance';
