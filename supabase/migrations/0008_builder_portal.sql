-- ============================================================================
-- Builder Portal — real estate developers who register projects and submit
-- bulk home loan requests for their buyers (per the brief: "Builders and
-- developers should also be able to register with us to receive bulk home
-- loan support for their customers").
--
-- Distinct from Agents: an agent refers individual customers one at a
-- time; a builder operates at the project level — many buyers in one
-- project, submitted together, mostly against home loans from
-- nationalized/partner banks. Projects are the natural grouping unit here,
-- not a single builder-wide bucket.
-- ============================================================================

alter type user_role add value 'builder';

create type builder_status as enum ('pending', 'approved', 'suspended');

-- ----------------------------------------------------------------------------
-- BUILDERS — one row per builder, keyed to their profile. Same
-- apply-then-admin-approves pattern as agents.
-- ----------------------------------------------------------------------------
create table builders (
  id uuid primary key references profiles(id) on delete cascade,
  company_name text,
  status builder_status not null default 'pending',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PROJECTS — a builder can register multiple developments; bulk loan
-- requests are submitted against a specific project so staff and the
-- builder can both see progress broken down by site.
-- ----------------------------------------------------------------------------
create table projects (
  id uuid primary key default uuid_generate_v4(),
  builder_id uuid not null references builders(id) on delete cascade,
  name text not null,
  location text,
  total_units int,
  created_at timestamptz not null default now()
);

create index idx_projects_builder on projects(builder_id);

-- Every lead can now optionally trace back to the project (and therefore
-- the builder) that submitted it in bulk.
alter table leads add column project_id uuid references projects(id);
create index idx_leads_project on leads(project_id);

-- ============================================================================
-- RLS
-- ============================================================================
alter table builders enable row level security;
alter table projects enable row level security;

create function is_builder()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from builders where id = auth.uid() and status = 'approved'
  );
$$;

create policy "builders_select_own_or_staff" on builders
  for select using (auth.uid() = id or is_staff());
create policy "builders_insert_own" on builders
  for insert with check (auth.uid() = id);
create policy "builders_update_staff" on builders
  for update using (is_staff());

create policy "projects_select_own_or_staff" on projects
  for select using (builder_id = auth.uid() or is_staff());
create policy "projects_insert_own" on projects
  for insert with check (builder_id = auth.uid() and is_builder());
create policy "projects_update_own_or_staff" on projects
  for update using (builder_id = auth.uid() or is_staff());

-- leads: extend the existing select policy to also let an approved
-- builder see leads submitted against their own projects.
drop policy if exists "leads_select_own_or_staff_or_agent" on leads;
create policy "leads_select_own_staff_agent_or_builder" on leads
  for select using (
    auth.uid() = user_id or is_staff()
    or (agent_id is not null and agent_id = auth.uid() and is_agent())
    or (
      project_id is not null and is_builder()
      and exists (select 1 from projects p where p.id = project_id and p.builder_id = auth.uid())
    )
  );

-- Lead INSERT is already covered by "leads_insert_any" (0001, check true).

-- ============================================================================
-- GRANTS (base privileges required before RLS applies — see 0006)
-- ============================================================================
grant select, insert, update on public.builders to authenticated;
grant select, insert, update on public.projects to authenticated;
