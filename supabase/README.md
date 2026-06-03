# Loan Market — Supabase (Stage 2)

Database schema, constraints, triggers, Row Level Security (RLS), and the
contact-request/payment state machine for the Loan Market marketplace.

```
supabase/
  migrations/
    0001_init.sql        ← the full schema + RLS (apply this to Supabase)
  tests/
    00_shim.sql          ← local-only: fakes Supabase auth/roles on plain Postgres
    10_seed.sql          ← test users + sample data (fixed UUIDs)
    20_rls_tests.sql     ← behavioural + RLS test scenarios
```

## What this models

Two marketplace boards over one unified `contact_requests` table:

- **Board 1 — Borrower loan requests.** Borrowers post; the public sees a
  limited preview; verified lenders see full detail and can request contact;
  the borrower approves; a conversation opens on approval. Verified lenders get
  5 approved contacts/week during the free launch.
- **Board 2 — Lender listings.** Verified lenders post products; borrowers
  browse and request contact; the lender approves. Free during launch. When the
  paid feature is switched on, the borrower pays $5 **only after** the lender
  approves, within a 24-hour window, before the conversation opens.

**Privacy is the core invariant:** direct contact info (email/phone/website)
lives only in `profiles` / `lender_profiles`, which are never publicly readable.
The public reads through contact-free views (`loan_request_previews`,
`lender_directory`, `lender_listing_cards`). People only ever reach each other
through an approved in-platform conversation.

## Apply to Supabase

Option A — Supabase CLI (recommended, version-controlled):

```bash
supabase link --project-ref <your-project-ref>
supabase db push           # applies everything in migrations/
```

Option B — SQL editor: paste `migrations/0001_init.sql` into the dashboard SQL
editor and run. It is one idempotent-ordered script.

After applying, create your first admin (the guard intentionally blocks
self-assigning admin from the client; do it from the SQL editor / service role):

```sql
update public.profiles set role = 'admin' where user_id = '<your-auth-user-id>';
```

### Scheduled jobs (optional, recommended)
Two maintenance functions are meant to run on a schedule via `pg_cron`:

```sql
-- in the Supabase SQL editor, after enabling pg_cron under Database → Extensions
select cron.schedule('expire-overdue-contacts', '*/5 * * * *',
                     $$ select public.expire_overdue_contact_requests(); $$);
select cron.schedule('purge-expired-messages', '0 3 * * *',
                     $$ select public.purge_expired_messages(); $$);
```

The payment path is also race-safe without cron: `mark_contact_request_paid`
re-checks the 24h window inside the transaction, so a late payment can never
open a conversation.

## Test the RLS locally (plain Postgres)

The `tests/` folder proves the policies on a throwaway Postgres DB. The shim
fakes the Supabase `auth` schema + `anon`/`authenticated`/`service_role` roles
and an `auth.uid()` that reads a session setting, so tests can impersonate users.

```bash
createdb loanmarket_test
psql -d loanmarket_test -f supabase/tests/00_shim.sql
psql -d loanmarket_test -f supabase/migrations/0001_init.sql
psql -d loanmarket_test -f supabase/tests/10_seed.sql
psql -d loanmarket_test -f supabase/tests/20_rls_tests.sql
```

Impersonation pattern used throughout the tests:

```sql
begin;
  set local role authenticated;                                  -- act as a normal signed-in user
  select set_config('request.jwt.claim.sub', '<user-uuid>', true); -- ...this specific user
  -- queries here are now subject to RLS as that user
rollback;
```

Lines marked `EXPECT-FAIL` are negative tests — the printed `ERROR:` is the
pass condition (RLS or a guard correctly refused the action).

> Do **not** run `00_shim.sql` against a real Supabase project; Supabase already
> provides `auth` and the API roles.
