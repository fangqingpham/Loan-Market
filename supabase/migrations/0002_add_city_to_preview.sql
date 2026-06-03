-- ============================================================================
-- Stage 6: add `city` to the public loan_request_previews view.
-- The original view omitted it; the public board spec requires province + city.
-- No contact information is exposed — city is a free-text field on loan_requests
-- (not linked to profiles).
-- ============================================================================

-- DROP + recreate is required because CREATE OR REPLACE VIEW cannot add a
-- column in the middle of the column list (Postgres treats the positional
-- shift as a rename attempt and errors).
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
  lr.created_at
from public.loan_requests lr
where lr.status = 'active';

grant select on public.loan_request_previews to anon, authenticated;
