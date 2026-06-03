-- ============================================================================
-- Stage 7 (revision): split lender verification into two paths.
--
--   * LICENSED entities (mortgage_broker, mortgage_agent, financing_company,
--     bank, credit_union) are verified from the licence/registration number
--     captured at signup. A backend licence check (stubbed for now — see
--     lib/licence-check.ts) sets `licence_verification_status`. No verification
--     FORM for these lenders.
--
--   * PRIVATE lenders have no licence to check, so they complete the
--     verification form (incorporated >1yr, no-upfront-fee, interest
--     compliance, platform rules).
--
-- This migration adds columns to TRACK the licence-check outcome. It does NOT
-- itself perform any check and does NOT grant verified status — final
-- `verification_status` remains admin-controlled via guard_lender_verification.
-- ============================================================================

-- Outcome of the (backend) licence/registration check.
create type licence_verification_status as enum (
  'not_applicable',   -- private lenders: no licence to verify
  'pending',          -- awaiting the backend check
  'verified',         -- licence found and active
  'not_found',        -- licence not found in the registry
  'suspended'         -- licence found but suspended/inactive
);

alter table public.lender_profiles
  add column licence_verification_status licence_verification_status
    not null default 'pending',
  add column licence_checked_at timestamptz,
  add column licence_check_message text;

-- Private lenders never have a licence to check.
update public.lender_profiles
  set licence_verification_status = 'not_applicable'
  where is_private_lender = true;
