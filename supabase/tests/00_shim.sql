-- ── Local Supabase environment shim (TEST ONLY — never deployed) ──
-- Recreates the parts of a Supabase project the migration depends on, so the
-- migration + RLS can be tested on a plain PostgreSQL instance.
-- DO NOT run this on a real Supabase project — it already has auth + roles.
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin noinherit bypassrls; end if;
end $$;

grant anon, authenticated, service_role to postgres;

create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);
-- auth.uid() reads a session GUC we set per test to simulate the logged-in user
-- (this is the same claim Supabase populates from the JWT).
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
