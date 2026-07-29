-- ============================================================================
-- SECURITY FIX — role privilege escalation.
--
-- Two related gaps found during review:
--
-- 1) There was no RLS policy letting staff update *someone else's*
--    profile row. This meant approveAgent/approveBuilder's attempt to set
--    profiles.role = 'agent' / 'builder' on the APPLICANT's row was
--    silently blocked by RLS — the agents/builders table itself updated
--    fine, but the profiles.role flip never actually took effect. Fixed
--    below with a proper staff-only "update any profile" policy.
--
-- 2) The existing "update own profile" policy had no restriction on
--    *which columns* a user can change on their own row — meaning any
--    logged-in customer could, via a direct API call (bypassing the app
--    entirely), PATCH their own profiles row and set role = 'admin'.
--    RLS alone can't block a single column like this; it needs a trigger
--    that inspects the actual change being made.
-- ============================================================================

-- Staff can update any profile (needed for role promotion on approval).
create policy "profiles_update_staff_any" on profiles
  for update using (is_staff());

-- Block role changes from anyone who isn't already staff — applies even
-- to a user updating their own row directly via the API, not just through
-- our app's UI.
create or replace function prevent_role_self_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if NEW.role is distinct from OLD.role then
    if not is_staff() then
      raise exception 'Only staff can change a user role';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists prevent_role_self_escalation_trigger on profiles;
create trigger prevent_role_self_escalation_trigger
  before update on profiles
  for each row execute function prevent_role_self_escalation();
