-- ============================================================================
-- Stage 11: expose licence_number (and a couple of safe display fields) on the
-- public lender views so product cards can show a verified lender's licence
-- number "if applicable".
--
-- Why this is safe:
--   * Only VERIFIED lenders appear in these views (the WHERE clause is unchanged).
--   * A licence/registration number for a licensed broker, agent, bank, etc. is
--     PUBLIC registry information (e.g. FSRA's public register) — it is a trust
--     signal, not contact information. Private lenders have no licence number,
--     so the column is simply null for them.
--   * NO contact columns (phone, email, website, address) are added. Those stay
--     in lender_profiles, owner/admin-only.
--
-- lender_listing_cards depends on lender_directory, so drop the dependent first,
-- recreate lender_directory with the new column, then recreate the card view.
-- ============================================================================

drop view if exists public.lender_listing_cards;
drop view if exists public.lender_directory;

-- Verified Lender Directory: safe business fields only, verified lenders only.
-- Adds licence_number (public registry info for licensed lenders; null for private).
create view public.lender_directory as
select
  lp.id,
  lp.business_name,
  lp.lender_type,
  lp.brokerage_or_company_name,
  lp.operating_provinces,
  lp.is_private_lender,
  lp.licence_number
from public.lender_profiles lp
where lp.verification_status = 'verified';

-- Board 2 browse cards: active listings joined to safe lender display fields.
create view public.lender_listing_cards as
select
  ll.id,
  ll.lender_id,
  ll.product_title,
  ll.loan_category,
  ll.service_area,
  ll.amount_range,
  ll.term_range,
  ll.rate_range,
  ll.secured_status,
  ll.product_description,
  ll.important_conditions,
  ll.created_at,
  ld.business_name,
  ld.lender_type,
  ld.brokerage_or_company_name,
  ld.is_private_lender,
  ld.licence_number
from public.lender_listings ll
join public.lender_directory ld on ld.id = ll.lender_id
where ll.status = 'active';

grant select on public.lender_directory     to anon, authenticated;
grant select on public.lender_listing_cards to anon, authenticated;
