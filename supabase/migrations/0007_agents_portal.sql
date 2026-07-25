-- ============================================================================
-- Agents Portal — external partners (DSAs, connectors) who refer customers
-- and earn a commission cut of what the partner bank/NBFC pays Finlyst on
-- a successful, disbursed loan.
--
-- Design: agents are NOT just another staff role. They can't see other
-- agents' referrals, can't touch internal admin tools, and their earnings
-- are tracked explicitly (commissions table) rather than inferred — since
-- real money owed to a real external person needs an auditable record,
-- not a status field. Payout itself stays manual/off-platform until a
-- payment gateway exists (Phase 2, per the locked V1 scope) — this just
-- makes sure nothing is ever lost or ambiguous in the meantime.
-- ============================================================================

alter type user_role add value 'agent';

create type agent_status as enum ('pending', 'approved', 'suspended');
create type commission_status as enum ('pending', 'approved', 'paid');

-- ----------------------------------------------------------------------------
-- AGENTS — one row per agent, keyed to their profile. Anyone can apply to
-- become an agent (status starts 'pending'); an admin approval flips both
-- agents.status and profiles.role to 'agent', which is what actually
-- unlocks the /agent portal (see middleware).
-- ----------------------------------------------------------------------------
create table agents (
  id uuid primary key references profiles(id) on delete cascade,
  agency_name text,
  commission_rate numeric(5,2) not null default 0.50, -- percent, e.g. 0.50 = 0.5%
  status agent_status not null default 'pending',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Every lead can now optionally trace back to the agent who brought it in.
-- Nullable — most leads still come directly from the marketing site.
alter table leads add column agent_id uuid references agents(id);
create index idx_leads_agent on leads(agent_id);

-- ----------------------------------------------------------------------------
-- COMMISSIONS — one row per payable commission, created by staff once an
-- agent-referred application is disbursed. Amount is entered manually
-- against the actual disbursed loan amount (staff-verified), calculated
-- at the agent's rate but editable — real payouts don't always match a
-- clean percentage, and staff need the final say.
-- ----------------------------------------------------------------------------
create table commissions (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references agents(id),
  application_id uuid not null references applications(id),
  disbursed_amount numeric(14,2),
  rate_applied numeric(5,2),
  commission_amount numeric(12,2) not null,
  status commission_status not null default 'pending',
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (application_id) -- one commission record per application
);

create index idx_commissions_agent on commissions(agent_id, status);

-- ============================================================================
-- RLS
-- ============================================================================
alter table agents enable row level security;
alter table commissions enable row level security;

create function is_agent()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from agents where id = auth.uid() and status = 'approved'
  );
$$;

-- agents: the agent sees their own row; staff see all; anyone authenticated
-- can create their own pending application row (the "Become an agent" form).
create policy "agents_select_own_or_staff" on agents
  for select using (auth.uid() = id or is_staff());
create policy "agents_insert_own" on agents
  for insert with check (auth.uid() = id);
create policy "agents_update_staff" on agents
  for update using (is_staff());

-- leads: extend the existing owner-or-staff policy to also let an
-- *approved* agent see (but not edit) leads they personally referred.
drop policy if exists "leads_select_own_or_staff" on leads;
create policy "leads_select_own_or_staff_or_agent" on leads
  for select using (
    auth.uid() = user_id or is_staff()
    or (agent_id is not null and agent_id = auth.uid() and is_agent())
  );

-- Note: lead INSERT is already covered by "leads_insert_any" (0001) with
-- check (true) — that already allows agents (and anyone) to create leads,
-- including ones with agent_id set. No new policy needed here.

-- commissions: the agent sees only their own; staff manage all.
create policy "commissions_select_own_or_staff" on commissions
  for select using (agent_id = auth.uid() or is_staff());
create policy "commissions_staff_write" on commissions
  for all using (is_staff()) with check (is_staff());

-- ============================================================================
-- GRANTS (see 0006 — base grants are required before RLS can apply)
-- ============================================================================
grant select, insert, update on public.agents to authenticated;
grant select on public.commissions to authenticated;
