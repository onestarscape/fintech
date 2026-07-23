# Finlyst — Phase 0 (Foundation)

A lead-generation and application-facilitation platform for loans, insurance,
and bank accounts, built on a reusable **Dynamic Product Engine** — every
financial product is a configured row in the database, not a code path.

> "Finlyst" is a placeholder brand name — rename freely (see "Renaming the
> brand" below).

## What's in Phase 0

- Marketing site: landing page, product pages, About, Contact, FAQs, Privacy, Terms
- Dynamic Product Engine: `products` table drives icon, description, form
  fields, required documents, and workflow stages for every product —
  launches with Home Loan, Personal Loan, and Business Loan seeded
- Guided application flow: lead capture -> product-specific fields -> review -> submit
- Auth: Google OAuth, email/password, forgot/reset password (Facebook + OTP
  wired for later, per your V1 scope lock)
- Customer dashboard: applications list, application detail with a real
  status timeline, secure document upload
- Admin dashboard: overview stats, leads table, applications table,
  application detail with manual status updates, RM assignment, document
  verification
- Full database schema + Row Level Security policies
- Design system: Space Grotesk / Inter / IBM Plex Mono, indigo-violet accent
  on warm paper — deliberately not generic banking blue/green

## What's NOT in Phase 0 (by design, per the locked V1 scope)

- Employee Panel, Builder Portal, Zoho CRM/Books sync — Phase 2
- Payment gateway — not needed until you charge customers
- Live bank/NBFC APIs — statuses are updated manually in Admin for V1
- Facebook login, Mobile OTP — architecture is ready, just not wired

---

## 1. Configure Supabase

1. Create a project at supabase.com.
2. In the SQL Editor, run the three migration files **in order**:
   - `supabase/migrations/0001_init.sql` — schema, RLS policies
   - `supabase/migrations/0002_seed.sql` — 3 launch products + partner logos
   - `supabase/migrations/0003_storage.sql` — private documents bucket
3. Go to **Authentication -> Providers** and enable:
   - **Email** (on by default)
   - **Google** — you'll need a Google OAuth Client ID/Secret (see step 2 below)
4. Go to **Authentication -> URL Configuration** and add your site URL (e.g.
   `http://localhost:3000` for dev, your Vercel URL for prod) plus
   `<url>/auth/callback` as a redirect URL.
5. Copy your project's **Project URL**, **anon public key**, and **service
   role key** from Project Settings -> API.

### Making yourself an admin

After you sign up once through the app, run this in the SQL Editor
(replace with your email):

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## 2. Configure Google OAuth

1. In Google Cloud Console, create an OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
3. Paste the Client ID and Secret into Supabase -> Authentication -> Providers -> Google.

## 3. Run locally

```bash
npm install
cp .env.example .env.local   # fill in the 3 Supabase values
npm run dev
```

Visit http://localhost:3000.

## 4. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (vercel.com/new).
3. Add the three environment variables from `.env.example` in Vercel's
   Project Settings -> Environment Variables.
4. Deploy. Update your Supabase Auth URL Configuration with the resulting
   `*.vercel.app` domain (and `/auth/callback`).

## Renaming the brand

"Finlyst" appears in: `src/app/layout.tsx` (metadata), `src/components/shared/site-header.tsx`,
`src/components/shared/site-footer.tsx`, and the `(auth)` layout. A find-and-replace
for "Finlyst" across `src/` covers it.

## Adding a new financial product (the point of the Dynamic Product Engine)

No code change needed — insert a row into `products`:

```sql
insert into products (slug, name, short_description, icon, category, display_order, workflow_stages, required_documents, form_schema, assigned_team)
values ('vehicle-loan', 'Vehicle Loan', '...', 'Car', 'Loan', 4,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Approved","Disbursed","Rejected"]',
  '[{"key":"pan","label":"PAN Card","required":true}]',
  '[{"key":"loan_amount","label":"Loan Amount","type":"number","required":true,"step":1}]',
  'Vehicle Loan Desk');
```

If you use a new icon name, add it to `src/lib/product-engine/icons.ts`
(one line — the only "code" a new product ever touches in V1). Phase 2's
admin-managed product creation removes even that.

## A note on the hand-written database types

`src/types/database.ts` is hand-written to match the SQL schema so the
project type-checks before you have a live Supabase project. Once your
project exists, replace it with generated types for full accuracy:

```bash
npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
```

A few call sites that join related tables (e.g. `applications` joined with
`products` and `leads`) currently type as `any` for the same reason —
regenerating types will fix this automatically since Postgrest can resolve
the foreign-key relationships from your live schema.
