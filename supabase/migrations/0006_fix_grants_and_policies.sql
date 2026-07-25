-- ============================================================================
-- FIX: missing base privilege grants.
--
-- RLS policies only take effect once a role already has the underlying
-- table-level privilege (SELECT/INSERT/UPDATE) — RLS narrows access, it
-- doesn't grant it. Tables created via raw SQL (as our migrations do)
-- don't automatically pick up Supabase's usual anon/authenticated grants
-- the way tables created through the dashboard Table Editor do. This was
-- missing from 0001_init.sql — that's the root cause of "permission
-- denied for table products/partners" on the live site.
-- ============================================================================

grant usage on schema public to anon, authenticated;

-- Public marketing data — readable by anyone, logged in or not.
grant select on public.products to anon, authenticated;
grant select on public.partners to anon, authenticated;

-- Pre-auth lead capture — the guided flow's first step works before login.
grant insert on public.leads to anon;

-- Everything else requires a session; RLS (already in place) then narrows
-- each authenticated user to their own rows, or opens fully for staff.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.leads to authenticated;
grant select, insert, update on public.applications to authenticated, anon;
grant select, insert, update on public.documents to authenticated;
grant select, insert on public.status_history to authenticated;
grant select, update on public.notifications to authenticated;
grant insert on public.notifications to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, update on public.follow_ups to authenticated;

-- ============================================================================
-- FIX: two RLS policy gaps found while auditing this — both would have
-- silently broken the guest (not-yet-logged-in) application flow, since
-- the guided flow intentionally allows starting an application before
-- login (see src/lib/actions/applications.ts).
-- ============================================================================

-- 1) applications_insert_own only allowed auth.uid() = user_id, which is
--    never true for a guest (auth.uid() is null, user_id is inserted as
--    null too — null = null is not true in SQL). Allow the null/null case.
drop policy if exists "applications_insert_own" on applications;
create policy "applications_insert_own" on applications
  for insert with check (
    auth.uid() = user_id or user_id is null or is_staff()
  );

-- 2) status_history_insert_staff required is_staff(), but the application
--    action logs the initial "submitted" entry as the customer themselves
--    right after they submit — not a staff member. Allow the application's
--    own owner (or a guest on a user_id-null application) to log it too.
drop policy if exists "status_history_insert_staff" on status_history;
create policy "status_history_insert_own_or_staff" on status_history
  for insert with check (
    is_staff() or exists (
      select 1 from applications a
      where a.id = application_id
      and (a.user_id = auth.uid() or a.user_id is null)
    )
  );
