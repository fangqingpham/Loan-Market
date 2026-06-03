-- ============================================================================
-- Stage 13b: CREDITS system.
--
-- Lenders spend credits to contact a borrower (per loan category). Credits are
-- bought in packs with money via Stripe. Everything here is GATED behind the new
-- `lender_contact_credits_enabled` platform setting (default false), so until
-- you enable it the existing free-launch behaviour (free + weekly cap) is
-- unchanged and NOTHING is charged.
--
-- Model:
--   * credit_wallets  — one balance row per user.
--   * credit_transactions — append-only ledger (purchase / spend / refund / grant).
--   * Lender requests contact  -> credits SPENT (per category). Insufficient -> blocked.
--   * Request rejected / cancelled / expired -> credits REFUNDED.
--     (So a lender only ultimately pays for contacts that actually open.)
--   * Stripe webhook -> add_credits_for_purchase() tops up the wallet.
-- ============================================================================

-- New setting flag (idempotent).
alter table public.platform_settings
  add column if not exists lender_contact_credits_enabled boolean not null default false;

-- Ledger entry kinds.
do $$ begin
  create type credit_txn_type as enum ('purchase','spend','refund','grant');
exception when duplicate_object then null; end $$;

-- ── wallet + ledger ─────────────────────────────────────────────────────────
create table if not exists public.credit_wallets (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  balance    int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  type               credit_txn_type not null,
  amount             int not null,            -- + for purchase/refund/grant, - for spend
  balance_after      int not null,
  contact_request_id uuid references public.contact_requests(id) on delete set null,
  stripe_session_id  text,
  note               text,
  created_at         timestamptz not null default now()
);
create index if not exists idx_credit_txn_user on public.credit_transactions(user_id, created_at desc);
create index if not exists idx_credit_txn_request on public.credit_transactions(contact_request_id);
create index if not exists idx_credit_txn_session on public.credit_transactions(stripe_session_id);

alter table public.credit_wallets      enable row level security;
alter table public.credit_transactions enable row level security;

grant select on public.credit_wallets      to authenticated;
grant select on public.credit_transactions to authenticated;

-- Read own wallet/ledger; admins read all. No direct writes (functions only).
drop policy if exists cw_select on public.credit_wallets;
create policy cw_select on public.credit_wallets for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists ct_select on public.credit_transactions;
create policy ct_select on public.credit_transactions for select
  using (user_id = auth.uid() or public.is_admin());

-- ── internal: adjust a wallet + write a ledger row (atomic, row-locked) ──────
create or replace function public._adjust_credits(
  p_user uuid, p_delta int, p_type credit_txn_type,
  p_request_id uuid, p_session text, p_note text
)
returns int language plpgsql security definer set search_path = public as $$
declare v_cur int; v_new int;
begin
  select balance into v_cur from public.credit_wallets where user_id = p_user for update;
  if not found then
    insert into public.credit_wallets(user_id, balance) values (p_user, 0)
      on conflict (user_id) do nothing;
    v_cur := 0;
  end if;

  v_new := v_cur + p_delta;
  if v_new < 0 then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  update public.credit_wallets set balance = v_new, updated_at = now() where user_id = p_user;

  insert into public.credit_transactions(
    user_id, type, amount, balance_after, contact_request_id, stripe_session_id, note
  ) values (p_user, p_type, p_delta, v_new, p_request_id, p_session, p_note);

  return v_new;
end;
$$;
revoke execute on function public._adjust_credits(uuid,int,credit_txn_type,uuid,text,text) from public;

-- ── per-category contact cost in CREDITS (mirror of the TS constant) ─────────
create or replace function public.contact_credit_cost(p_category loan_category)
returns int language sql immutable as $$
  select case p_category
    when 'personal'           then 25
    when 'debt_consolidation' then 40
    when 'auto'               then 40
    when 'business'           then 60
    when 'mortgage'           then 90
    when 'refinance'          then 90
    when 'home_equity'        then 120
    else 25
  end;
$$;
grant execute on function public.contact_credit_cost(loan_category) to anon, authenticated;

-- ── refund the credits spent on a request (idempotent no-op when nothing) ────
create or replace function public._refund_request_credits(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_spend record; v_already boolean;
begin
  select * into v_spend
  from public.credit_transactions
  where contact_request_id = p_request_id and type = 'spend'
  order by created_at asc limit 1;
  if not found then return; end if;

  select exists(
    select 1 from public.credit_transactions
    where contact_request_id = p_request_id and type = 'refund'
  ) into v_already;
  if v_already then return; end if;

  perform public._adjust_credits(
    v_spend.user_id, abs(v_spend.amount), 'refund', p_request_id, null,
    'Refund: contact not completed'
  );
end;
$$;
revoke execute on function public._refund_request_credits(uuid) from public;

-- ── top up a wallet after a Stripe credit-pack purchase (webhook/admin) ──────
create or replace function public.add_credits_for_purchase(
  p_user uuid, p_credits int, p_stripe_session_id text
)
returns int language plpgsql security definer set search_path = public as $$
declare v_bal int;
begin
  -- Only the backend (service_role: auth.uid() is null) or an admin may credit.
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Not authorized to add credits';
  end if;
  if p_credits is null or p_credits <= 0 then
    raise exception 'Invalid credit amount';
  end if;

  -- Idempotency: never double-credit the same Stripe session.
  if p_stripe_session_id is not null and exists(
    select 1 from public.credit_transactions
    where stripe_session_id = p_stripe_session_id and type = 'purchase'
  ) then
    select balance into v_bal from public.credit_wallets where user_id = p_user;
    return coalesce(v_bal, 0);
  end if;

  return public._adjust_credits(p_user, p_credits, 'purchase', null, p_stripe_session_id, 'Credit pack purchase');
end;
$$;
grant execute on function public.add_credits_for_purchase(uuid,int,text) to authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════════
-- Re-create the contact lifecycle functions to add credit spend / refund. These
-- are byte-for-byte the Stage 2 versions PLUS the credit hooks; behaviour is
-- identical when lender_contact_credits_enabled = false.
-- ════════════════════════════════════════════════════════════════════════════

-- Lender requests contact with a borrower: now SPENDS credits when enabled.
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

  insert into public.contact_requests (
    direction, requester_user_id, recipient_user_id, borrower_id, lender_id,
    loan_request_id, status, payment_required, payment_status, amount_cents
  ) values (
    'lender_to_borrower', v_uid, v_recipient, v_borrower_id, v_lender_id,
    p_loan_request_id, 'pending', false, 'not_required', 0
  ) returning id into v_new_id;

  -- Credits: when enabled, the lender pays the per-category cost up front. If
  -- they lack credits, _adjust_credits raises INSUFFICIENT_CREDITS and the whole
  -- function (including the insert above) rolls back. Refunded later if the
  -- request is rejected / cancelled / expired.
  select lender_contact_credits_enabled into v_credits_enabled
    from public.platform_settings where id = 1;
  if coalesce(v_credits_enabled, false) then
    v_cost := public.contact_credit_cost(v_category);
    perform public._adjust_credits(v_uid, -v_cost, 'spend', v_new_id, null, 'Contact request');
  end if;

  return v_new_id;
end;
$$;

-- Reject: refund any credits the requester spent.
create or replace function public.reject_contact_request(p_request_id uuid)
returns contact_request_status
language plpgsql security definer set search_path = public as $$
declare r public.contact_requests%rowtype;
begin
  select * into r from public.contact_requests where id = p_request_id for update;
  if not found then raise exception 'Contact request not found'; end if;
  if r.recipient_user_id <> auth.uid() then
    raise exception 'Only the recipient can reject this request';
  end if;
  if r.status <> 'pending' then
    raise exception 'Only pending requests can be rejected (current: %)', r.status;
  end if;

  update public.contact_requests
    set status = 'rejected', rejected_at = now()
    where id = p_request_id;

  perform public._refund_request_credits(p_request_id);
  return 'rejected';
end;
$$;

-- Cancel: refund any credits the requester spent.
create or replace function public.cancel_contact_request(p_request_id uuid)
returns contact_request_status
language plpgsql security definer set search_path = public as $$
declare r public.contact_requests%rowtype;
begin
  select * into r from public.contact_requests where id = p_request_id for update;
  if not found then raise exception 'Contact request not found'; end if;
  if r.requester_user_id <> auth.uid() then
    raise exception 'Only the requester can cancel this request';
  end if;
  if r.status not in ('pending','approved_pending_payment') then
    raise exception 'This request can no longer be cancelled (current: %)', r.status;
  end if;

  update public.contact_requests
    set status = 'cancelled', cancelled_at = now()
    where id = p_request_id;

  perform public._refund_request_credits(p_request_id);
  return 'cancelled';
end;
$$;

-- Expiry sweep: refund credits for each request that expires.
create or replace function public.expire_overdue_contact_requests()
returns int language plpgsql security definer set search_path = public as $$
declare v_count int; r record;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  v_count := 0;
  for r in
    update public.contact_requests
      set status = 'expired',
          payment_status = case when payment_status = 'pending' then 'failed' else payment_status end
      where status = 'approved_pending_payment'
        and expires_at is not null and expires_at < now()
      returning id
  loop
    perform public._refund_request_credits(r.id);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;
