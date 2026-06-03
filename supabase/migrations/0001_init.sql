-- ============================================================================
-- Loan Market — Stage 2: schema, constraints, triggers, RLS, helper functions
-- ----------------------------------------------------------------------------
-- Privacy invariants enforced here:
--   * Direct contact info (phone/email/website) lives ONLY in `profiles` and
--     `lender_profiles`, which are NEVER publicly readable.
--   * Public reads go through SECURITY DEFINER views exposing safe columns only.
--   * A conversation can exist ONLY when a contact_request is approved AND
--     (payment not required OR payment is paid). All writes to contact_requests
--     and conversations go through vetted SECURITY DEFINER functions.
-- Out of scope (intentionally NOT modeled): loan approval, underwriting,
--   credit checks, document uploads, AI matching, lender ranking.
-- ============================================================================

-- gen_random_uuid() is in core on PG13+. (Supabase also ships pgcrypto.)

-- ─────────────────────────── ENUM TYPES ────────────────────────────────────
create type user_role               as enum ('borrower', 'lender', 'admin');

create type lender_type             as enum (
  'mortgage_broker', 'mortgage_agent', 'private_lender',
  'financing_company', 'bank', 'credit_union', 'other'
);

create type lender_verification_status as enum (
  'pending_verification', 'verified', 'rejected', 'suspended'
);

create type province               as enum (
  'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'
);

create type loan_category           as enum (
  'mortgage','refinance','personal','auto','business',
  'debt_consolidation','home_equity','other'
);

create type secured_status          as enum ('secured','unsecured','either');

create type listing_status          as enum ('active','delisted','removed_by_admin');

create type contact_direction       as enum ('lender_to_borrower','borrower_to_lender');

create type contact_request_status  as enum (
  'pending','approved_pending_payment','approved','rejected','cancelled','expired'
);

create type payment_status          as enum (
  'not_required','pending','paid','failed','refunded'
);

create type conversation_status     as enum ('active','closed');

create type report_status           as enum ('open','reviewing','closed');

create type payment_type            as enum ('listing_contact_fee');

create type payment_txn_status      as enum ('pending','paid','failed','refunded');

-- ──────────────────── generic updated_at trigger fn ────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─────────────────────────── platform_settings ─────────────────────────────
-- Single-row config table driving launch behaviour & business rules.
create table public.platform_settings (
  id                                       int primary key default 1 check (id = 1),
  free_launch_enabled                      boolean not null default true,
  -- when false, borrower->lender contact is free; when true, the $5 gate applies
  borrower_listing_contact_payment_enabled boolean not null default false,
  borrower_target                          int not null default 100,
  verified_lender_target                   int not null default 30,
  lender_free_contacts_per_week            int not null default 5,
  message_retention_months                 int not null default 6,
  borrower_payment_expiry_hours            int not null default 24,
  borrower_listing_contact_fee_cents       int not null default 500,
  created_at                               timestamptz not null default now(),
  updated_at                               timestamptz not null default now()
);
insert into public.platform_settings (id) values (1) on conflict do nothing;

create trigger trg_platform_settings_updated
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

-- ════════════════════════════ PROFILE TABLES ═══════════════════════════════

-- 1) profiles — base identity + role. CONTAINS CONTACT INFO (phone/email).
--    Readable only by the owner and admins. Never exposed publicly.
create table public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  role        user_role not null,
  full_name   text,
  email       text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index idx_profiles_role on public.profiles(role);

create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 2) borrower_profiles — NON-contact public-ish display info for a borrower.
--    (No phone/email here — those stay in `profiles`.)
create table public.borrower_profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  city         text,
  province     province,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_borrower_profiles_updated
  before update on public.borrower_profiles
  for each row execute function public.set_updated_at();

-- 3) lender_profiles — business record. CONTAINS DIRECT CONTACT INFO.
--    Readable only by the owner and admins. Public sees safe columns via the
--    `lender_directory` view only. Verification is admin-controlled.
create table public.lender_profiles (
  id                              uuid primary key default gen_random_uuid(),
  user_id                         uuid not null unique references auth.users(id) on delete cascade,
  legal_name                      text,
  business_name                   text,
  business_email                  text,          -- hidden
  phone                           text,          -- hidden
  website_or_social               text,          -- hidden
  business_address_or_service_area text,         -- hidden (may contain address)
  lender_type                     lender_type,
  licence_number                  text,          -- hidden (admin verification only)
  brokerage_or_company_name       text,
  operating_provinces             province[] not null default '{}',
  verification_status             lender_verification_status not null default 'pending_verification',
  verification_notes              text,
  is_private_lender               boolean not null default false,
  incorporated_over_1_year        boolean,
  accepts_no_upfront_fee_rule     boolean not null default false,
  accepts_interest_compliance     boolean not null default false,
  accepts_platform_rules          boolean not null default false,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);
create index idx_lender_profiles_verification on public.lender_profiles(verification_status);
create index idx_lender_profiles_provinces on public.lender_profiles using gin(operating_provinces);

create trigger trg_lender_profiles_updated
  before update on public.lender_profiles
  for each row execute function public.set_updated_at();

-- ════════════════════════ BOARD 1: loan_requests ═══════════════════════════
-- Borrowers post; public sees preview view; verified lenders see full rows.
create table public.loan_requests (
  id                     uuid primary key default gen_random_uuid(),
  borrower_id            uuid not null references public.borrower_profiles(id) on delete cascade,
  loan_category          loan_category not null,
  province               province,
  city                   text,
  amount_range           text,
  purpose_category       text,
  secured_status         secured_status,
  credit_score_range     text,
  income_range           text,
  employment_type        text,
  loan_term_range        text,
  expected_interest_range text,
  borrower_note          text,
  status                 listing_status not null default 'active',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index idx_loan_requests_borrower on public.loan_requests(borrower_id);
create index idx_loan_requests_status on public.loan_requests(status);
create index idx_loan_requests_search on public.loan_requests(status, loan_category, province);
create index idx_loan_requests_created on public.loan_requests(created_at desc);

create trigger trg_loan_requests_updated
  before update on public.loan_requests
  for each row execute function public.set_updated_at();

-- ═══════════════════════ BOARD 2: lender_listings ══════════════════════════
-- Verified lenders post product listings. Intentionally NO contact columns —
-- contact happens only through an approved in-platform conversation.
create table public.lender_listings (
  id                  uuid primary key default gen_random_uuid(),
  lender_id           uuid not null references public.lender_profiles(id) on delete cascade,
  product_title       text not null,
  loan_category       loan_category not null,
  service_area        text,
  amount_range        text,
  term_range          text,
  rate_range          text,
  secured_status      secured_status,
  product_description text,
  important_conditions text,
  status              listing_status not null default 'active',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index idx_lender_listings_lender on public.lender_listings(lender_id);
create index idx_lender_listings_status on public.lender_listings(status);
create index idx_lender_listings_search on public.lender_listings(status, loan_category);
create index idx_lender_listings_created on public.lender_listings(created_at desc);

create trigger trg_lender_listings_updated
  before update on public.lender_listings
  for each row execute function public.set_updated_at();

-- ═══════════════════ UNIFIED contact_requests (both boards) ════════════════
create table public.contact_requests (
  id                 uuid primary key default gen_random_uuid(),
  direction          contact_direction not null,
  requester_user_id  uuid not null references auth.users(id) on delete cascade,
  recipient_user_id  uuid not null references auth.users(id) on delete cascade,
  borrower_id        uuid not null references public.borrower_profiles(id) on delete cascade,
  lender_id          uuid not null references public.lender_profiles(id) on delete cascade,
  loan_request_id    uuid references public.loan_requests(id) on delete cascade,
  lender_listing_id  uuid references public.lender_listings(id) on delete cascade,
  status             contact_request_status not null default 'pending',
  payment_required   boolean not null default false,
  payment_status     payment_status not null default 'not_required',
  amount_cents       int not null default 0,
  expires_at         timestamptz,
  requested_at       timestamptz not null default now(),
  approved_at        timestamptz,
  rejected_at        timestamptz,
  cancelled_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- Direction <-> link consistency:
  constraint chk_direction_links check (
    (direction = 'lender_to_borrower'
       and loan_request_id is not null and lender_listing_id is null)
    or
    (direction = 'borrower_to_lender'
       and lender_listing_id is not null and loan_request_id is null)
  ),
  constraint chk_no_self_contact check (requester_user_id <> recipient_user_id)
);
create index idx_cr_requester on public.contact_requests(requester_user_id);
create index idx_cr_recipient on public.contact_requests(recipient_user_id);
create index idx_cr_borrower on public.contact_requests(borrower_id);
create index idx_cr_lender on public.contact_requests(lender_id);
create index idx_cr_loan_request on public.contact_requests(loan_request_id);
create index idx_cr_listing on public.contact_requests(lender_listing_id);
create index idx_cr_status on public.contact_requests(status);
-- supports the weekly approved-contacts count for a lender:
create index idx_cr_weekly on public.contact_requests(lender_id, direction, status, approved_at);
-- supports the expiry sweep:
create index idx_cr_expiry on public.contact_requests(status, expires_at);

create trigger trg_contact_requests_updated
  before update on public.contact_requests
  for each row execute function public.set_updated_at();

-- ─────────────────────────────── conversations ─────────────────────────────
-- One conversation per approved+payable contact request.
create table public.conversations (
  id                 uuid primary key default gen_random_uuid(),
  contact_request_id uuid not null unique references public.contact_requests(id) on delete cascade,
  borrower_id        uuid not null references public.borrower_profiles(id) on delete cascade,
  lender_id          uuid not null references public.lender_profiles(id) on delete cascade,
  status             conversation_status not null default 'active',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_conversations_borrower on public.conversations(borrower_id);
create index idx_conversations_lender on public.conversations(lender_id);

create trigger trg_conversations_updated
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────── messages ──────────────────────────────
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id  uuid not null references auth.users(id) on delete cascade,
  body            text not null check (length(btrim(body)) > 0),
  created_at      timestamptz not null default now(),
  expires_at      timestamptz   -- set by trigger from platform_settings retention
);
create index idx_messages_conversation on public.messages(conversation_id, created_at);
create index idx_messages_expiry on public.messages(expires_at);
create index idx_messages_sender on public.messages(sender_user_id);

-- Set message expiry from the configured retention window (default 6 months).
create or replace function public.set_message_expiry()
returns trigger language plpgsql as $$
declare
  months int;
begin
  if new.expires_at is null then
    select message_retention_months into months from public.platform_settings where id = 1;
    new.expires_at := new.created_at + make_interval(months => coalesce(months, 6));
  end if;
  return new;
end;
$$;
create trigger trg_messages_set_expiry
  before insert on public.messages
  for each row execute function public.set_message_expiry();

-- ──────────────────────────────────── reports ──────────────────────────────
create table public.reports (
  id                    uuid primary key default gen_random_uuid(),
  reporter_user_id      uuid not null references auth.users(id) on delete cascade,
  reported_user_id      uuid not null references auth.users(id) on delete cascade,
  related_conversation_id uuid references public.conversations(id) on delete set null,
  related_loan_request_id uuid references public.loan_requests(id) on delete set null,
  related_lender_listing_id uuid references public.lender_listings(id) on delete set null,
  reason                text not null,
  description           text,
  status                report_status not null default 'open',
  admin_notes           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index idx_reports_status on public.reports(status);
create index idx_reports_reported on public.reports(reported_user_id);
create index idx_reports_reporter on public.reports(reporter_user_id);

create trigger trg_reports_updated
  before update on public.reports
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────── blocks ───────────────────────────────
create table public.blocks (
  id               uuid primary key default gen_random_uuid(),
  blocker_user_id  uuid not null references auth.users(id) on delete cascade,
  blocked_user_id  uuid not null references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  constraint chk_no_self_block check (blocker_user_id <> blocked_user_id),
  constraint uq_block unique (blocker_user_id, blocked_user_id)
);
create index idx_blocks_blocker on public.blocks(blocker_user_id);
create index idx_blocks_blocked on public.blocks(blocked_user_id);

-- ──────────────────────────────────── payments ─────────────────────────────
create table public.payments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  contact_request_id uuid references public.contact_requests(id) on delete set null,
  payment_type       payment_type not null,
  amount_cents       int not null,
  status             payment_txn_status not null default 'pending',
  stripe_session_id  text unique,
  created_at         timestamptz not null default now()
);
create index idx_payments_user on public.payments(user_id);
create index idx_payments_contact_request on public.payments(contact_request_id);
create index idx_payments_status on public.payments(status);

-- ─────────────────────────────────── admin_notes ───────────────────────────
create table public.admin_notes (
  id                       uuid primary key default gen_random_uuid(),
  admin_user_id            uuid not null references auth.users(id) on delete cascade,
  related_user_id          uuid references auth.users(id) on delete set null,
  related_lender_profile_id uuid references public.lender_profiles(id) on delete set null,
  note                     text not null,
  created_at               timestamptz not null default now()
);
create index idx_admin_notes_related_user on public.admin_notes(related_user_id);
create index idx_admin_notes_related_lender on public.admin_notes(related_lender_profile_id);

-- ════════════════════════ HELPER FUNCTIONS (RLS) ═══════════════════════════
-- All SECURITY DEFINER so they can inspect locked-down tables without granting
-- the caller direct read access (prevents privilege/contact-info leakage and
-- avoids recursive RLS). search_path pinned for safety.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_verified_lender()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.lender_profiles
    where user_id = auth.uid() and verification_status = 'verified'
  );
$$;

create or replace function public.current_app_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where user_id = auth.uid();
$$;

-- Is the current user a participant (borrower or lender side) of a conversation?
create or replace function public.is_conversation_participant(p_conversation_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.conversations c
    join public.borrower_profiles bp on bp.id = c.borrower_id
    join public.lender_profiles  lp on lp.id = c.lender_id
    where c.id = p_conversation_id
      and (bp.user_id = auth.uid() or lp.user_id = auth.uid())
  );
$$;

-- Does the current user (as a lender) share an OPEN conversation with a borrower?
-- Lets the lender side see a borrower's NON-contact display profile while chatting.
create or replace function public.shares_conversation_with_borrower(p_borrower_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.conversations c
    join public.lender_profiles lp on lp.id = c.lender_id
    where c.borrower_id = p_borrower_id
      and lp.user_id = auth.uid()
  );
$$;

-- Has either user blocked the other?
create or replace function public.is_blocked_between(p_user_a uuid, p_user_b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocks
    where (blocker_user_id = p_user_a and blocked_user_id = p_user_b)
       or (blocker_user_id = p_user_b and blocked_user_id = p_user_a)
  );
$$;

-- Count of a lender's APPROVED inbound contacts in the current (ISO) week.
-- "Approved contact" = a lender_to_borrower request that reached 'approved'.
create or replace function public.lender_weekly_approved_contacts(p_lender_id uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int
  from public.contact_requests
  where lender_id = p_lender_id
    and direction = 'lender_to_borrower'
    and status = 'approved'
    and approved_at >= date_trunc('week', now());
$$;

-- ═══════════════ CONTACT-REQUEST LIFECYCLE (write path = functions) ═════════
-- contact_requests & conversations have NO direct INSERT/UPDATE policies for
-- users; every state change goes through these vetted SECURITY DEFINER fns so
-- the state machine + privacy + payment gate are enforced in one place.

-- internal: open the conversation for an approved+payable request
create or replace function public._open_conversation(p_request_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_conv_id uuid;
begin
  insert into public.conversations (contact_request_id, borrower_id, lender_id, status)
  select id, borrower_id, lender_id, 'active'
  from public.contact_requests where id = p_request_id
  on conflict (contact_request_id) do nothing
  returning id into v_conv_id;

  if v_conv_id is null then
    select id into v_conv_id from public.conversations where contact_request_id = p_request_id;
  end if;
  return v_conv_id;
end;
$$;

-- BOARD 1: a verified lender requests contact with a borrower (via loan request)
create or replace function public.request_loan_request_contact(p_loan_request_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_lender_id uuid;
  v_borrower_id uuid;
  v_recipient uuid;
  v_new_id uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if not public.is_verified_lender() then
    raise exception 'Only verified lenders can request borrower contact';
  end if;

  select id into v_lender_id from public.lender_profiles where user_id = v_uid;

  select lr.borrower_id, bp.user_id
    into v_borrower_id, v_recipient
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

  return v_new_id;
end;
$$;

-- BOARD 2: a borrower requests contact with a lender (via product listing)
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

  -- NOTE: payment is NOT taken here. payment_status stays 'not_required' until
  -- the lender approves (then it becomes 'pending' with a 24h window).
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

-- Recipient approves a contact request.
--  * lender_to_borrower (free): -> approved, conversation opens, weekly cap enforced.
--  * borrower_to_lender, no payment: -> approved, conversation opens.
--  * borrower_to_lender, payment required: -> approved_pending_payment, 24h window,
--    NO conversation until paid.
create or replace function public.approve_contact_request(p_request_id uuid)
returns contact_request_status
language plpgsql security definer set search_path = public as $$
declare
  r public.contact_requests%rowtype;
  v_cap int;
  v_used int;
  v_hours int;
  v_free_launch boolean;
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

  -- free path: enforce the lender's weekly free-contact cap during launch
  if r.direction = 'lender_to_borrower' then
    select free_launch_enabled, lender_free_contacts_per_week
      into v_free_launch, v_cap from public.platform_settings where id = 1;
    if coalesce(v_free_launch, false) then
      v_used := public.lender_weekly_approved_contacts(r.lender_id);
      if v_used >= coalesce(v_cap, 5) then
        raise exception 'Lender weekly free contact limit reached (% of %)', v_used, v_cap;
      end if;
    end if;
  end if;

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

-- Recipient rejects a pending request.
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
  return 'rejected';
end;
$$;

-- Requester cancels (before approval, or before paying).
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
  return 'cancelled';
end;
$$;

-- Mark a paid request as paid and open the conversation.
-- INTENDED CALLER: backend/Stripe webhook (service_role) or admin — NOT the
-- borrower self-confirming. Re-checks the 24h window inside the txn to close the
-- race between true expiry and the scheduled expiry sweep.
create or replace function public.mark_contact_request_paid(
  p_request_id uuid,
  p_stripe_session_id text default null
)
returns contact_request_status
language plpgsql security definer set search_path = public as $$
declare r public.contact_requests%rowtype;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Not authorized to confirm payment';
  end if;

  select * into r from public.contact_requests where id = p_request_id for update;
  if not found then raise exception 'Contact request not found'; end if;
  if not r.payment_required then raise exception 'This request does not require payment'; end if;
  if r.status <> 'approved_pending_payment' then
    raise exception 'Request is not awaiting payment (current: %)', r.status;
  end if;

  -- race guard: expired before payment landed
  if r.expires_at is not null and now() > r.expires_at then
    update public.contact_requests
      set status = 'expired', payment_status = 'failed'
      where id = p_request_id;
    return 'expired';
  end if;

  update public.contact_requests
    set status = 'approved', payment_status = 'paid'
    where id = p_request_id;

  insert into public.payments (user_id, contact_request_id, payment_type, amount_cents, status, stripe_session_id)
  values (r.requester_user_id, r.id, 'listing_contact_fee', r.amount_cents, 'paid', p_stripe_session_id);

  perform public._open_conversation(p_request_id);
  return 'approved';
end;
$$;

-- Maintenance: expire overdue paid-pending requests. Schedule via pg_cron.
create or replace function public.expire_overdue_contact_requests()
returns int language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  with updated as (
    update public.contact_requests
      set status = 'expired',
          payment_status = case when payment_status = 'pending' then 'failed' else payment_status end
      where status = 'approved_pending_payment'
        and expires_at is not null and expires_at < now()
      returning 1
  )
  select count(*) into v_count from updated;
  return v_count;
end;
$$;

-- Maintenance: purge messages past their retention window. Schedule via pg_cron.
create or replace function public.purge_expired_messages()
returns int language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  with deleted as (
    delete from public.messages where expires_at < now() returning 1
  )
  select count(*) into v_count from deleted;
  return v_count;
end;
$$;

-- ═══════════════════ SAFE PUBLIC VIEWS (contact-info free) ══════════════════
-- These views run with the (postgres) owner's rights and deliberately expose
-- ONLY non-sensitive columns. They are how public/borrower clients read data
-- that lives in otherwise locked-down tables. No phone/email/website/address
-- column is ever selected here.

-- Board 1 public preview: limited fields, active requests only. No borrower link.
create view public.loan_request_previews as
select
  lr.id,
  lr.loan_category,
  lr.province,
  lr.amount_range,
  lr.purpose_category,
  lr.secured_status,
  lr.loan_term_range,
  lr.created_at
from public.loan_requests lr
where lr.status = 'active';

-- Verified Lender Directory: safe business fields only, verified lenders only.
create view public.lender_directory as
select
  lp.id,
  lp.business_name,
  lp.lender_type,
  lp.brokerage_or_company_name,
  lp.operating_provinces,
  lp.is_private_lender
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
  ld.lender_type
from public.lender_listings ll
join public.lender_directory ld on ld.id = ll.lender_id
where ll.status = 'active';

grant select on public.loan_request_previews to anon, authenticated;
grant select on public.lender_directory     to anon, authenticated;
grant select on public.lender_listing_cards to anon, authenticated;

-- ═════════════════ PRIVILEGE-ESCALATION GUARD TRIGGERS ═════════════════════

-- Stop users from making themselves admin.
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new;  -- admins, or trusted server-side calls (no JWT), may set any role
  end if;
  if tg_op = 'INSERT' and new.role = 'admin' then
    raise exception 'Cannot self-assign admin role';
  end if;
  if tg_op = 'UPDATE' and new.role is distinct from old.role then
    raise exception 'Cannot change your own role';
  end if;
  return new;
end;
$$;
create trigger trg_guard_profile_role
  before insert or update on public.profiles
  for each row execute function public.guard_profile_role();

-- Lenders cannot verify/suspend themselves; only admins touch verification.
create or replace function public.guard_lender_verification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new;  -- admins, or trusted server-side calls (no JWT), bypass the guard
  end if;
  if tg_op = 'INSERT' then
    new.verification_status := 'pending_verification';
    new.verification_notes  := null;
  elsif tg_op = 'UPDATE' then
    if new.verification_status is distinct from old.verification_status
       or new.verification_notes is distinct from old.verification_notes then
      raise exception 'Verification status is managed by admins only';
    end if;
  end if;
  return new;
end;
$$;
create trigger trg_guard_lender_verification
  before insert or update on public.lender_profiles
  for each row execute function public.guard_lender_verification();

-- Block check across the two participants of a conversation (for messaging).
create or replace function public.conversation_blocked(p_conversation_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare v_borrower_uid uuid; v_lender_uid uuid;
begin
  select bp.user_id, lp.user_id into v_borrower_uid, v_lender_uid
  from public.conversations c
  join public.borrower_profiles bp on bp.id = c.borrower_id
  join public.lender_profiles  lp on lp.id = c.lender_id
  where c.id = p_conversation_id;
  if v_borrower_uid is null then return false; end if;
  return public.is_blocked_between(v_borrower_uid, v_lender_uid);
end;
$$;

-- ═══════════════════════════ ENABLE RLS ════════════════════════════════════
alter table public.platform_settings  enable row level security;
alter table public.profiles            enable row level security;
alter table public.borrower_profiles   enable row level security;
alter table public.lender_profiles     enable row level security;
alter table public.loan_requests       enable row level security;
alter table public.lender_listings     enable row level security;
alter table public.contact_requests    enable row level security;
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.reports             enable row level security;
alter table public.blocks              enable row level security;
alter table public.payments            enable row level security;
alter table public.admin_notes         enable row level security;

-- ═══════════════════════ BASE TABLE/FUNCTION GRANTS ════════════════════════
-- PostgREST roles must hold privileges; RLS then narrows what they can touch.
grant select on public.lender_listings to anon, authenticated;
grant select on public.platform_settings to anon, authenticated;

grant select, insert, update, delete on public.profiles          to authenticated;
grant select, insert, update, delete on public.borrower_profiles to authenticated;
grant select, insert, update, delete on public.lender_profiles   to authenticated;
grant select, insert, update, delete on public.loan_requests     to authenticated;
grant insert, update, delete         on public.lender_listings   to authenticated;
grant update                         on public.platform_settings to authenticated;
grant select                         on public.contact_requests  to authenticated;
grant select                         on public.conversations     to authenticated;
grant select, insert                 on public.messages          to authenticated;
grant select, insert, update, delete on public.reports           to authenticated;
grant select, insert, delete         on public.blocks            to authenticated;
grant select                         on public.payments          to authenticated;
grant select, insert, update, delete on public.admin_notes       to authenticated;

-- Lifecycle RPCs callable by signed-in users; internal/maintenance ones not.
grant execute on function public.request_loan_request_contact(uuid) to authenticated;
grant execute on function public.request_listing_contact(uuid)      to authenticated;
grant execute on function public.approve_contact_request(uuid)      to authenticated;
grant execute on function public.reject_contact_request(uuid)       to authenticated;
grant execute on function public.cancel_contact_request(uuid)       to authenticated;
grant execute on function public.mark_contact_request_paid(uuid, text) to authenticated, service_role;
grant execute on function public.expire_overdue_contact_requests()  to service_role;
grant execute on function public.purge_expired_messages()           to service_role;
revoke execute on function public._open_conversation(uuid) from public;

-- ════════════════════════════ RLS POLICIES ═════════════════════════════════

-- platform_settings: world-readable config; admin-only writes.
create policy ps_select on public.platform_settings for select using (true);
create policy ps_update on public.platform_settings for update using (public.is_admin()) with check (public.is_admin());

-- profiles: owner + admin only (CONTACT INFO — never public).
create policy profiles_select on public.profiles for select
  using (user_id = auth.uid() or public.is_admin());
create policy profiles_insert on public.profiles for insert
  with check (public.is_admin() or (user_id = auth.uid() and role <> 'admin'));
create policy profiles_update on public.profiles for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy profiles_delete on public.profiles for delete
  using (public.is_admin());

-- borrower_profiles: owner + admin + a lender sharing a conversation (no contact info here).
create policy bp_select on public.borrower_profiles for select
  using (user_id = auth.uid() or public.is_admin() or public.shares_conversation_with_borrower(id));
create policy bp_insert on public.borrower_profiles for insert
  with check (user_id = auth.uid());
create policy bp_update on public.borrower_profiles for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy bp_delete on public.borrower_profiles for delete
  using (user_id = auth.uid() or public.is_admin());

-- lender_profiles: owner + admin only (CONTACT INFO). Public uses lender_directory view.
create policy lp_select on public.lender_profiles for select
  using (user_id = auth.uid() or public.is_admin());
create policy lp_insert on public.lender_profiles for insert
  with check (user_id = auth.uid());
create policy lp_update on public.lender_profiles for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy lp_delete on public.lender_profiles for delete
  using (user_id = auth.uid() or public.is_admin());

-- loan_requests: owner manages; verified lenders read active full rows; admin all.
-- Public/anon get nothing here (they read loan_request_previews instead).
create policy lr_select on public.loan_requests for select
  using (
    public.is_admin()
    or exists (select 1 from public.borrower_profiles bp where bp.id = borrower_id and bp.user_id = auth.uid())
    or (status = 'active' and public.is_verified_lender())
  );
create policy lr_insert on public.loan_requests for insert
  with check (exists (select 1 from public.borrower_profiles bp where bp.id = borrower_id and bp.user_id = auth.uid()));
create policy lr_update on public.loan_requests for update
  using (public.is_admin() or exists (select 1 from public.borrower_profiles bp where bp.id = borrower_id and bp.user_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.borrower_profiles bp where bp.id = borrower_id and bp.user_id = auth.uid()));
create policy lr_delete on public.loan_requests for delete
  using (public.is_admin() or exists (select 1 from public.borrower_profiles bp where bp.id = borrower_id and bp.user_id = auth.uid()));

-- lender_listings: public reads active; verified lender manages own; admin all.
create policy ll_select on public.lender_listings for select
  using (
    status = 'active'
    or public.is_admin()
    or exists (select 1 from public.lender_profiles lp where lp.id = lender_id and lp.user_id = auth.uid())
  );
create policy ll_insert on public.lender_listings for insert
  with check (
    public.is_verified_lender()
    and exists (select 1 from public.lender_profiles lp where lp.id = lender_id and lp.user_id = auth.uid())
  );
create policy ll_update on public.lender_listings for update
  using (public.is_admin() or exists (select 1 from public.lender_profiles lp where lp.id = lender_id and lp.user_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.lender_profiles lp where lp.id = lender_id and lp.user_id = auth.uid()));
create policy ll_delete on public.lender_listings for delete
  using (public.is_admin() or exists (select 1 from public.lender_profiles lp where lp.id = lender_id and lp.user_id = auth.uid()));

-- contact_requests: readable by either party + admin. Writes go through functions only.
create policy cr_select on public.contact_requests for select
  using (requester_user_id = auth.uid() or recipient_user_id = auth.uid() or public.is_admin());

-- conversations: participants + admin read. Created only by functions.
create policy conv_select on public.conversations for select
  using (public.is_conversation_participant(id) or public.is_admin());

-- messages: participants + admin read; participants of an ACTIVE, unblocked
-- conversation may post as themselves.
create policy msg_select on public.messages for select
  using (public.is_conversation_participant(conversation_id) or public.is_admin());
create policy msg_insert on public.messages for insert
  with check (
    sender_user_id = auth.uid()
    and public.is_conversation_participant(conversation_id)
    and exists (select 1 from public.conversations c where c.id = conversation_id and c.status = 'active')
    and not public.conversation_blocked(conversation_id)
  );

-- reports: reporter sees own; admin sees/updates all.
create policy rep_select on public.reports for select
  using (reporter_user_id = auth.uid() or public.is_admin());
create policy rep_insert on public.reports for insert
  with check (reporter_user_id = auth.uid());
create policy rep_update on public.reports for update
  using (public.is_admin()) with check (public.is_admin());
create policy rep_delete on public.reports for delete
  using (public.is_admin());

-- blocks: a user manages their own block list (cannot see who blocked them).
create policy blk_select on public.blocks for select
  using (blocker_user_id = auth.uid() or public.is_admin());
create policy blk_insert on public.blocks for insert
  with check (blocker_user_id = auth.uid());
create policy blk_delete on public.blocks for delete
  using (blocker_user_id = auth.uid() or public.is_admin());

-- payments: owner + admin read. Inserts/updates via service_role (webhook).
create policy pay_select on public.payments for select
  using (user_id = auth.uid() or public.is_admin());

-- admin_notes: admin only, all operations.
create policy an_all on public.admin_notes for all
  using (public.is_admin()) with check (public.is_admin());
