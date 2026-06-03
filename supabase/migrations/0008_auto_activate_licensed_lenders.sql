-- ============================================================================
-- Loan Market — 0008: auto-activate licensed lenders on signup (conduit model)
-- ----------------------------------------------------------------------------
-- Business change: Loan Market no longer performs lender "verification". A
-- LICENSED lender (broker, agent, financing company, bank, credit union) who
-- provides a licence number and accepts the platform rules is ACTIVATED
-- immediately on signup. The licence number is shown publicly as self-reported;
-- borrowers confirm it with the regulator themselves. Loan Market does not
-- verify, vet, or endorse lenders.
--
-- This replaces the guard so that, on INSERT, a non-private (licensed) lender
-- may start as 'verified'. PRIVATE lenders (not enabled at launch) still start
-- 'pending_verification'. We KEEP the important protection: a lender can never
-- promote/suspend THEMSELVES later — any change to verification_status on
-- UPDATE by a non-admin is still rejected.
--
-- Note on the value name: the enum value is still literally 'verified' (we did
-- not rename the DB enum to avoid a riskier migration). In the UI this state is
-- shown to lenders as "Active" — see the dashboard labels. Marketplace gating
-- (is_verified_lender()) keys off this value, so setting it to 'verified' is
-- what grants access.
-- ============================================================================

create or replace function public.guard_lender_verification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Admins and trusted server-side calls (no JWT) may set any status.
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Conduit model: licensed lenders activate immediately; private lenders
    -- (deferred at launch) still require review. A self-signup can therefore
    -- only ever land on 'verified' (licensed) or 'pending_verification'
    -- (private) — never 'rejected'/'suspended', and never with admin notes.
    if coalesce(new.is_private_lender, false) then
      new.verification_status := 'pending_verification';
    else
      new.verification_status := 'verified';
    end if;
    new.verification_notes := null;

  elsif tg_op = 'UPDATE' then
    -- Still block self-promotion/suspension: only admins change these.
    if new.verification_status is distinct from old.verification_status
       or new.verification_notes is distinct from old.verification_notes then
      raise exception 'Verification status is managed by admins only';
    end if;
  end if;

  return new;
end;
$$;
