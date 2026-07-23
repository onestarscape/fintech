-- ============================================================================
-- Milestone 2: Messages (per-application thread) + Referral tracking
-- ============================================================================

-- ----------------------------------------------------------------------------
-- MESSAGES — one thread per application, between the customer and staff.
-- Kept simple by design: no separate "conversations" table, no read
-- receipts beyond a boolean. Application is the natural thread key since
-- every customer question is almost always about a specific application.
-- ----------------------------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_messages_application on messages(application_id, created_at);

alter table messages enable row level security;

create policy "messages_select_own_or_staff" on messages
  for select using (
    is_staff() or exists (
      select 1 from applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

create policy "messages_insert_own_or_staff" on messages
  for insert with check (
    sender_id = auth.uid()
    and (
      is_staff() or exists (
        select 1 from applications a
        where a.id = application_id and a.user_id = auth.uid()
      )
    )
  );

create policy "messages_update_mark_read" on messages
  for update using (
    is_staff() or exists (
      select 1 from applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- REFERRALS — every profile can refer others via /signup?ref=<id>.
-- No separate rewards ledger in V1 — just who-referred-whom and a count,
-- enough to show "X people joined using your link". Rewards logic (credits,
-- payouts) is a Phase 2 concern once payments exist at all.
-- ----------------------------------------------------------------------------
alter table profiles add column referred_by uuid references profiles(id);

-- Update the signup trigger to also capture referred_by from user metadata
-- (set client-side when ?ref= is present at signup).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    nullif(new.raw_user_meta_data->>'referred_by', '')::uuid
  );
  return new;
end;
$$;
