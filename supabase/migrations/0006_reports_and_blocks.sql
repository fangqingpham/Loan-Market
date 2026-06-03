-- ============================================================================
-- Stage 12: report & block helpers (SECURITY DEFINER).
--
-- Why these are needed:
--   * reports.reported_user_id is NOT NULL, but a reporter cannot read the
--     target's user_id (RLS hides borrower/lender identities). submit_report
--     resolves the reported user from the related entity with definer rights.
--   * blocking needs the OTHER participant's user_id, which the blocker also
--     can't read. block_in_conversation / unblock_in_conversation resolve it.
--
-- The block ENFORCEMENT already exists from Stage 2: the msg_insert policy
-- calls conversation_blocked(), so once a block row exists neither party can
-- post new messages. These functions just create/remove that row safely.
-- ============================================================================

-- Create a report. Exactly one target (loan request / listing / conversation).
-- Resolves the reported user server-side. For a conversation, only a participant
-- may report, and the reported user is the OTHER participant.
create or replace function public.submit_report(
  p_reason text,
  p_description text default null,
  p_loan_request_id uuid default null,
  p_lender_listing_id uuid default null,
  p_conversation_id uuid default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_reported uuid;
  v_targets int;
  v_new_id uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if p_reason is null or btrim(p_reason) = '' then raise exception 'A reason is required'; end if;

  v_targets :=
      (case when p_loan_request_id   is not null then 1 else 0 end)
    + (case when p_lender_listing_id is not null then 1 else 0 end)
    + (case when p_conversation_id   is not null then 1 else 0 end);
  if v_targets <> 1 then
    raise exception 'Exactly one report target is required';
  end if;

  if p_loan_request_id is not null then
    select bp.user_id into v_reported
    from public.loan_requests lr
    join public.borrower_profiles bp on bp.id = lr.borrower_id
    where lr.id = p_loan_request_id;

  elsif p_lender_listing_id is not null then
    select lp.user_id into v_reported
    from public.lender_listings ll
    join public.lender_profiles lp on lp.id = ll.lender_id
    where ll.id = p_lender_listing_id;

  elsif p_conversation_id is not null then
    select case when bp.user_id = v_uid then lp.user_id else bp.user_id end
      into v_reported
    from public.conversations c
    join public.borrower_profiles bp on bp.id = c.borrower_id
    join public.lender_profiles  lp on lp.id = c.lender_id
    where c.id = p_conversation_id
      and (bp.user_id = v_uid or lp.user_id = v_uid);  -- participant only
  end if;

  if v_reported is null then raise exception 'Report target not found'; end if;
  if v_reported = v_uid then raise exception 'You cannot report yourself'; end if;

  -- Duplicate guard: one ACTIVE report per reporter per reported user. While an
  -- earlier report against this lender is still open or under review, a new one
  -- is blocked (covers double-clicks, reporting two products from the same
  -- lender, and repeat reports of the same item). Once an admin closes it, the
  -- reporter may raise a fresh report if there is new behaviour.
  if exists (
    select 1 from public.reports
    where reporter_user_id = v_uid
      and reported_user_id = v_reported
      and status in ('open', 'reviewing')
  ) then
    raise exception 'DUPLICATE_ACTIVE_REPORT';
  end if;

  insert into public.reports (
    reporter_user_id, reported_user_id,
    related_loan_request_id, related_lender_listing_id, related_conversation_id,
    reason, description, status
  ) values (
    v_uid, v_reported,
    p_loan_request_id, p_lender_listing_id, p_conversation_id,
    p_reason, nullif(btrim(coalesce(p_description, '')), ''), 'open'
  ) returning id into v_new_id;

  return v_new_id;
end;
$$;

-- Resolve the other participant of a conversation for the current user.
create or replace function public._conversation_partner(p_conversation_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select case when bp.user_id = auth.uid() then lp.user_id else bp.user_id end
  from public.conversations c
  join public.borrower_profiles bp on bp.id = c.borrower_id
  join public.lender_profiles  lp on lp.id = c.lender_id
  where c.id = p_conversation_id
    and (bp.user_id = auth.uid() or lp.user_id = auth.uid());
$$;

-- Block the other participant of a conversation (idempotent).
create or replace function public.block_in_conversation(p_conversation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_other uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  v_other := public._conversation_partner(p_conversation_id);
  if v_other is null then raise exception 'Conversation not found'; end if;
  insert into public.blocks (blocker_user_id, blocked_user_id)
  values (v_uid, v_other)
  on conflict (blocker_user_id, blocked_user_id) do nothing;
end;
$$;

-- Remove a block the current user placed on their conversation partner.
create or replace function public.unblock_in_conversation(p_conversation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_other uuid;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  v_other := public._conversation_partner(p_conversation_id);
  if v_other is null then raise exception 'Conversation not found'; end if;
  delete from public.blocks where blocker_user_id = v_uid and blocked_user_id = v_other;
end;
$$;

-- Has the current user blocked their conversation partner? (for UI state)
create or replace function public.i_blocked_partner(p_conversation_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_other uuid;
begin
  if v_uid is null then return false; end if;
  v_other := public._conversation_partner(p_conversation_id);
  if v_other is null then return false; end if;
  return exists (
    select 1 from public.blocks
    where blocker_user_id = v_uid and blocked_user_id = v_other
  );
end;
$$;

grant execute on function public.submit_report(text, text, uuid, uuid, uuid) to authenticated;
grant execute on function public.block_in_conversation(uuid)   to authenticated;
grant execute on function public.unblock_in_conversation(uuid) to authenticated;
grant execute on function public.i_blocked_partner(uuid)       to authenticated;
revoke execute on function public._conversation_partner(uuid) from public;
