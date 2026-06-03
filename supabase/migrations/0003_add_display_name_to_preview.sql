-- ============================================================================
-- Stage 6 (followup): add borrower `display_name` (username/nickname) to the
-- public loan_request_previews view so lenders and the public can tell requests
-- apart by the borrower's self-chosen handle.
--
-- Privacy note: `display_name` is a borrower-chosen nickname stored in
-- `borrower_profiles`, which the schema designates as NON-contact display info.
-- It is NOT the borrower's legal name (that lives in `profiles.full_name`,
-- alongside email/phone, and is never exposed). No contact info is added here.
-- The view runs with owner rights (like lender_directory), so it can read the
-- RLS-protected borrower_profiles table while exposing only this one safe column.
-- ============================================================================

drop view if exists public.loan_request_previews;

create view public.loan_request_previews as
select
  lr.id,
  lr.loan_category,
  lr.province,
  lr.city,
  lr.amount_range,
  lr.purpose_category,
  lr.secured_status,
  lr.loan_term_range,
  lr.created_at,
  bp.display_name
from public.loan_requests lr
left join public.borrower_profiles bp on bp.id = lr.borrower_id
where lr.status = 'active';

grant select on public.loan_request_previews to anon, authenticated;
