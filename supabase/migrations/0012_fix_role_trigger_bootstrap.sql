-- ============================================================================
-- Update 14 — fix a bootstrapping bug in the role-escalation trigger.
--
-- The trigger added to block self-promotion (a customer editing their own
-- role via a direct API call) checks is_staff(), which itself checks
-- auth.uid(). But auth.uid() is NULL when a query runs from the Supabase
-- SQL Editor or via the service-role key — there's no logged-in app user
-- in that context at all. The trigger couldn't tell "an anonymous app
-- session trying to self-promote" apart from "the project owner running
-- SQL directly" — and blocked both.
--
-- Fix: allow the change when auth.uid() IS NULL (no app-level session —
-- only reachable via the SQL Editor or the service-role key, both of
-- which already require full Supabase project access) OR when the
-- caller is already staff. A logged-in customer's own session always has
-- a non-null auth.uid(), so this does not reopen the original hole.
-- ============================================================================

create or replace function prevent_role_self_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if NEW.role is distinct from OLD.role then
    if auth.uid() is not null and not is_staff() then
      raise exception 'Only staff can change a user role';
    end if;
  end if;
  return NEW;
end;
$$;
