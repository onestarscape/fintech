-- ============================================================================
-- V1 Schema — Dynamic Product Engine + Leads/Applications/Documents
-- Design principle: every financial product (Home Loan, Business Loan, etc.)
-- is a ROW in `products`, not a table or a code path. Admins configure new
-- products by editing rows. Zoho sync in Phase 2 will read/write against
-- `leads` / `applications` / `documents` without schema changes — every
-- table already carries an `external_ref` jsonb column reserved for that.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES — extends auth.users, adds role-based access
-- ----------------------------------------------------------------------------
create type user_role as enum ('customer', 'employee', 'admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  role user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS — the Dynamic Product Engine
-- One reusable application engine; products are DATA, not code.
-- ----------------------------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,               -- e.g. "home-loan"
  name text not null,                      -- "Home Loan"
  short_description text,
  icon text,                               -- lucide-react icon name
  category text not null,                  -- "Loan" | "Insurance" | "Account"
  display_order int not null default 0,
  is_active boolean not null default true,

  -- Configurable form: array of field definitions rendered by the
  -- application-flow engine. Each item shape:
  -- { key, label, type, required, options?, step }
  form_schema jsonb not null default '[]'::jsonb,

  -- Configurable required document list rendered by the upload step:
  -- [{ key, label, required }]
  required_documents jsonb not null default '[]'::jsonb,

  -- Ordered workflow stages this product's applications move through.
  -- e.g. ["Lead Received","Documents Pending","Under Review",
  --       "Sent to Partner","Approved","Disbursed","Rejected"]
  workflow_stages jsonb not null default '[]'::jsonb,

  assigned_team text,                      -- default RM team/queue label
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. PARTNERS — display-only in V1 (logos/trust section), no live integration
-- ----------------------------------------------------------------------------
create type partner_type as enum ('bank', 'nbfc', 'insurer', 'other');

create table partners (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type partner_type not null,
  logo_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. LEADS — captured the moment someone starts a product flow, even if
-- they never finish it. This is the top of funnel and must never be lost.
-- ----------------------------------------------------------------------------
create type lead_status as enum ('new', 'contacted', 'converted', 'dropped');

create table leads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null, -- null if captured pre-auth
  product_id uuid not null references products(id),
  full_name text not null,
  phone text not null,
  email text,
  city text,
  requirement text,
  status lead_status not null default 'new',
  external_ref jsonb default '{}'::jsonb,  -- reserved for future Zoho lead id, etc.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. APPLICATIONS — the guided flow's actual data, one per lead that
-- proceeds past initial capture. form_data is jsonb driven by the
-- product's form_schema — no per-product tables.
-- ----------------------------------------------------------------------------
create type application_status as enum (
  'in_progress', 'submitted', 'under_review', 'action_required',
  'approved', 'rejected', 'disbursed', 'cancelled'
);

create table applications (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  product_id uuid not null references products(id),
  form_data jsonb not null default '{}'::jsonb,
  status application_status not null default 'in_progress',
  current_stage text,                       -- must be one of product.workflow_stages
  assigned_rm_id uuid references profiles(id),
  external_ref jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. DOCUMENTS — metadata row per uploaded file; actual bytes live in
-- Supabase Storage private bucket `documents`, path pattern:
-- {application_id}/{doc_key}/{filename}
-- ----------------------------------------------------------------------------
create table documents (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  doc_key text not null,                   -- matches product.required_documents[].key
  label text not null,
  storage_path text not null,
  verified boolean not null default false,
  verified_by uuid references profiles(id),
  uploaded_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. STATUS_HISTORY — powers the Application Timeline UI
-- ----------------------------------------------------------------------------
create table status_history (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  status application_status not null,
  stage text,
  note text,
  changed_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text,
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index idx_leads_product on leads(product_id);
create index idx_leads_user on leads(user_id);
create index idx_applications_user on applications(user_id);
create index idx_applications_product on applications(product_id);
create index idx_applications_status on applications(status);
create index idx_documents_application on documents(application_id);
create index idx_status_history_application on status_history(application_id);
create index idx_notifications_user on notifications(user_id, is_read);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table partners enable row level security;
alter table leads enable row level security;
alter table applications enable row level security;
alter table documents enable row level security;
alter table status_history enable row level security;
alter table notifications enable row level security;

-- Helper: is the current user an admin or employee?
create function is_staff()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'employee')
  );
$$;

-- profiles: users see/edit their own row; staff see all
create policy "profiles_select_own_or_staff" on profiles
  for select using (auth.uid() = id or is_staff());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- products/partners: public read (active only) for anonymous marketing site,
-- staff manage
create policy "products_public_read" on products
  for select using (is_active = true or is_staff());
create policy "products_staff_write" on products
  for all using (is_staff()) with check (is_staff());

create policy "partners_public_read" on partners
  for select using (is_active = true or is_staff());
create policy "partners_staff_write" on partners
  for all using (is_staff()) with check (is_staff());

-- leads: owner or staff
create policy "leads_select_own_or_staff" on leads
  for select using (auth.uid() = user_id or is_staff());
create policy "leads_insert_any" on leads
  for insert with check (true); -- allows pre-auth lead capture from public flow
create policy "leads_update_staff" on leads
  for update using (is_staff());

-- applications: owner or staff
create policy "applications_select_own_or_staff" on applications
  for select using (auth.uid() = user_id or is_staff());
create policy "applications_insert_own" on applications
  for insert with check (auth.uid() = user_id or is_staff());
create policy "applications_update_own_or_staff" on applications
  for update using (auth.uid() = user_id or is_staff());

-- documents: via parent application ownership, or staff
create policy "documents_select_own_or_staff" on documents
  for select using (
    is_staff() or exists (
      select 1 from applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );
create policy "documents_insert_own_or_staff" on documents
  for insert with check (
    is_staff() or exists (
      select 1 from applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );
create policy "documents_update_staff" on documents
  for update using (is_staff());

-- status_history: read via application ownership, write staff only
create policy "status_history_select_own_or_staff" on status_history
  for select using (
    is_staff() or exists (
      select 1 from applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );
create policy "status_history_insert_staff" on status_history
  for insert with check (is_staff());

-- notifications: owner only
create policy "notifications_select_own" on notifications
  for select using (auth.uid() = user_id);
create policy "notifications_update_own" on notifications
  for update using (auth.uid() = user_id);
create policy "notifications_insert_staff" on notifications
  for insert with check (is_staff());
