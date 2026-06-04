-- ============================================================================
-- Loan Market — 0009: daily anti-spam contact cap (free for BOTH sides)
-- ----------------------------------------------------------------------------
-- Business change: the marketplace is free for borrowers AND lenders. To keep
-- the boards free of spam, each account may START up to `daily_contact_limit`
-- NEW contact requests per calendar day (America/Toronto). This is symmetric:
--   * a LENDER starting lender->borrower requests, and
--   * a BORROWER starting borrower->lender requests
-- are both capped, counted at REQUEST time (so it limits outreach volume
-- regardless of whether a request is later approved, declined, or cancelled).
--
-- This REPLACES the old weekly approved-contacts cap that was enforced when the
-- borrower approved a lender (lender_free_contacts_per_week). That weekly check
-- is removed from approve_contact_request below; the per-week setting column is
-- left in place (dormant) so nothing else that reads it breaks.
--
-- What is intentionally NOT changed:
--   * The approval requirement. A conversation (the only place contact info is
--     exchanged) still opens ONLY after the recipient approves. Untouched.
--   * The credits machinery and the borrower listing-contact fee. Both remain
--     gated off in platform_settings; this migration does not enable them.
--
-- "Contact" = starting a NEW conversation. Messages sent INSIDE a conversation
-- that is already open are never counted against the daily cap.
-- ============================================================================

-- New, tunable setting. Default 5. Change here (or via SQL) to retune the cap
-- without a code deploy. Mirrors DAILY_FREE_CONTACTS_PER_SIDE in lib/constants.ts.
alter table public.platform_settings
  add column if not exists daily_contact_limit int not null default 5;

-- Supports the per-user "requests started today" count cheaply.
create index if not exists idx_cr_daily
  on public.contact_requests(requester_user_id, requested_at);

-- ── helper: how many contact requests has this user STARTED today? ───────────
-- Day boundary is local midnight in America/Toronto (a Canadian product), not
-- UTC, so "5 per day" resets at a time that makes sense to users. SECURITY
-- DEFINER so the contact RPCs can call it; it only ever counts the caller's own
-- rows when invoked from those functions (they pass auth.uid()).
create or replace function public.contacts_sent_today(p_user uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int
  from public.contact_requests
  where requester_user_id = p_user
    and requested_at >= date_trunc('day', now() at time zone 'America/Toronto')
                          at time zone 'America/Toronto';
$$;
grant execute on function public.contacts_sent_today(uuid) to authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- Recreate the two REQUEST functions to enforce the daily cap before inserting.
-- Each is the latest prior version PLUS the cap check. The cap is checked AFTER
-- the duplicate guard (so a duplicate is reported as a duplicate, not a limit)
-- and BEFORE the insert (so a blocked attempt never creates a row, and never
-- counts toward the cap itself). On the 6th attempt of the day the count is 5,
-- so `5 >= 5` blocks it and exactly 5 per day get through.
-- ════════════════════════════════════════════════════════════════════════════

-- BOARD 1: a verified lender requests contact with a borrower (loan request).
-- (Latest prior version: migration 0007 — keeps the dormant credits hook.)
create or replace function public.request_loan_request_contact(p_loan_request_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_lender_id uuid;
  v_borrower_id uuid;
  v_recipient uuid;
  v_category loan_category;
  v_new_id uuid;
  v_credits_enabled boolean;
  v_cost int;
  v_daily_cap int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if not public.is_verified_lender() then
    raise exception 'Only verified lenders can request borrower contact';
  end if;

  select id into v_lender_id from public.lender_profiles where user_id = v_uid;

  select lr.borrower_id, bp.user_id, lr.loan_category
    into v_borrower_id, v_recipient, v_category
  from public.loan_requests lr
  join public.borrower_profiles bp on bp.id = lr.borrower_id
  where lr.id = p_loan_request_id and lr.status = 'active';

  if v_borrower_id is null then raise exception 'Loan request not found or not active'; end if;
  if v_recipient = v_uid then raise exception 'Cannot contact yourself'; end if;
  if public.is_blocked_between(v_uid, v_recipient) then raise exception 'Contact not allowed'; end if;

  if exists (
    select 1 from public.contact_requests
    where lender_id = v_lender_id and loan_request_id = p_loan_request_id
      and direction = 'lender_to_borrower'
      and status in ('pending','approved_pending_payment','approved')
  ) then
    raise exception 'An active contact request already exists for this loan request';
  end if;

  -- Daily anti-spam cap (counts everything this lender started today).
  select daily_contact_limit into v_daily_cap from public.platform_settings where id = 1;
  if public.contacts_sent_today(v_uid) >= coalesce(v_daily_cap, 5) then
    raise exception 'DAILY_CONTACT_LIMIT_REACHED';
  end if;

  insert into public.contact_requests (
    direction, requester_user_id, recipient_user_id, borrower_id, lender_id,
    loan_request_id, status, payment_required, payment_status, amount_cents
  ) values (
    'lender_to_borrower', v_uid, v_recipient, v_borrower_id, v_lender_id,
    p_loan_request_id, 'pending', false, 'not_required', 0
  ) returning id into v_new_id;

  -- Credits: dormant unless lender_contact_credits_enabled is true. Unchanged.
  select lender_contact_credits_enabled into v_credits_enabled
    from public.platform_settings where id = 1;
  if coalesce(v_credits_enabled, false) then
    v_cost := public.contact_credit_cost(v_category);
    perform public._adjust_credits(v_uid, -v_cost, 'spend', v_new_id, null, 'Contact request');
  end if;

  return v_new_id;
end;
$$;

-- BOARD 2: a borrower requests contact with a lender (product listing).
-- (Latest prior version: migration 0001.)
create or replace function public.request_listing_contact(p_lender_listing_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_borrower_id uuid;
  v_lender_id uuid;
  v_recipient uuid;
  v_pay_enabled boolean;
  v_fee int;
  v_new_id uuid;
  v_daily_cap int;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if public.current_app_role() <> 'borrower' then
    raise exception 'Only borrowers can request contact with a lender listing';
  end if;

  select id into v_borrower_id from public.borrower_profiles where user_id = v_uid;
  if v_borrower_id is null then raise exception 'Borrower profile required'; end if;

  select ll.lender_id, lp.user_id
    into v_lender_id, v_recipient
  from public.lender_listings ll
  join public.lender_profiles lp on lp.id = ll.lender_id
  where ll.id = p_lender_listing_id and ll.status = 'active';

  if v_lender_id is null then raise exception 'Listing not found or not active'; end if;
  if v_recipient = v_uid then raise exception 'Cannot contact yourself'; end if;
  if public.is_blocked_between(v_uid, v_recipient) then raise exception 'Contact not allowed'; end if;

  select borrower_listing_contact_payment_enabled, borrower_listing_contact_fee_cents
    into v_pay_enabled, v_fee
  from public.platform_settings where id = 1;

  if exists (
    select 1 from public.contact_requests
    where borrower_id = v_borrower_id and lender_listing_id = p_lender_listing_id
      and direction = 'borrower_to_lender'
      and status in ('pending','approved_pending_payment','approved')
  ) then
    raise exception 'An active contact request already exists for this listing';
  end if;

  -- Daily anti-spam cap (counts everything this borrower started today).
  select daily_contact_limit into v_daily_cap from public.platform_settings where id = 1;
  if public.contacts_sent_today(v_uid) >= coalesce(v_daily_cap, 5) then
    raise exception 'DAILY_CONTACT_LIMIT_REACHED';
  end if;

  insert into public.contact_requests (
    direction, requester_user_id, recipient_user_id, borrower_id, lender_id,
    lender_listing_id, status, payment_required, payment_status, amount_cents
  ) values (
    'borrower_to_lender', v_uid, v_recipient, v_borrower_id, v_lender_id,
    p_lender_listing_id, 'pending', coalesce(v_pay_enabled, false), 'not_required',
    case when coalesce(v_pay_enabled, false) then coalesce(v_fee, 500) else 0 end
  ) returning id into v_new_id;

  return v_new_id;
end;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- Recreate approve_contact_request WITHOUT the weekly cap. The cap now lives at
-- request time (above); approval no longer rejects on a per-week count. Payment
-- handling and conversation opening are unchanged. (Base: migration 0001.)
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.approve_contact_request(p_request_id uuid)
returns contact_request_status
language plpgsql security definer set search_path = public as $$
declare
  r public.contact_requests%rowtype;
  v_hours int;
begin
  select * into r from public.contact_requests where id = p_request_id for update;
  if not found then raise exception 'Contact request not found'; end if;
  if r.recipient_user_id <> auth.uid() then
    raise exception 'Only the recipient can approve this request';
  end if;
  if r.status <> 'pending' then
    raise exception 'Only pending requests can be approved (current: %)', r.status;
  end if;

  if r.payment_required then
    select borrower_payment_expiry_hours into v_hours from public.platform_settings where id = 1;
    update public.contact_requests
      set status = 'approved_pending_payment',
          payment_status = 'pending',
          approved_at = now(),
          expires_at = now() + make_interval(hours => coalesce(v_hours, 24))
      where id = p_request_id;
    return 'approved_pending_payment';
  end if;

  -- Free path: open the conversation immediately. (No weekly cap — the daily
  -- cap is enforced when the request is first started.)
  update public.contact_requests
    set status = 'approved',
        payment_status = 'not_required',
        approved_at = now(),
        expires_at = null
    where id = p_request_id;

  perform public._open_conversation(p_request_id);
  return 'approved';
end;
$$;

-- (Grants are unchanged — these function names already carry the right EXECUTE
--  grants from migrations 0001/0007; CREATE OR REPLACE preserves them.)
