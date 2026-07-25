-- ============================================================================
-- Phase 2, Milestone 1: Employee Panel foundations
-- ============================================================================

-- Leads can now be assigned to a specific employee, same as applications
-- already are via assigned_rm_id. Nullable — unassigned leads sit in a
-- shared queue until a staff member (or admin) claims/assigns them.
alter table leads add column assigned_to uuid references profiles(id);
create index idx_leads_assigned_to on leads(assigned_to);

-- ----------------------------------------------------------------------------
-- FOLLOW_UPS — doubles as "Tasks", "Follow-ups", and "Notes" from the brief.
-- A row with due_at set behaves like a task/follow-up (shows up as pending
-- until marked done); a row without due_at is just a note. One table
-- instead of three keeps the employee panel simple to reason about.
-- Can attach to a lead, an application, or both (usually just the lead
-- pre-conversion, then the application once one exists).
-- ----------------------------------------------------------------------------
create table follow_ups (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) on delete cascade,
  application_id uuid references applications(id) on delete cascade,
  assigned_to uuid references profiles(id),
  note text not null,
  due_at timestamptz,
  is_done boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  constraint follow_up_has_a_subject check (lead_id is not null or application_id is not null)
);

create index idx_follow_ups_assigned_to on follow_ups(assigned_to, is_done, due_at);
create index idx_follow_ups_lead on follow_ups(lead_id);
create index idx_follow_ups_application on follow_ups(application_id);

alter table follow_ups enable row level security;

-- Staff-only table — customers never see internal notes/tasks.
create policy "follow_ups_staff_all" on follow_ups
  for all using (is_staff()) with check (is_staff());
