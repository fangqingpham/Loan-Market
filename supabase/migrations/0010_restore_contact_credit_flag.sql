-- ============================================================================
-- Loan Market - 0010: restore dormant lender contact credits flag
-- ----------------------------------------------------------------------------
-- The current request_loan_request_contact RPC reads this platform setting after
-- creating the pending contact request. Some deployed databases have migration
-- 0009's RPC/daily cap but are missing the dormant 0007 credits flag, which
-- makes the RPC fail with:
--
--   column platform_settings.lender_contact_credits_enabled does not exist
--
-- The flag remains false, so borrower privacy and the free launch contact flow
-- are unchanged.
-- ============================================================================

alter table public.platform_settings
  add column if not exists lender_contact_credits_enabled boolean not null default false;

