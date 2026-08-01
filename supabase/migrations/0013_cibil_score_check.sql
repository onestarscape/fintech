-- ============================================================================
-- Update 15 — Free CIBIL Score Check.
--
-- IMPORTANT — read before connecting a real bureau API later:
-- This is a REQUEST flow, not a live score lookup. Actually pulling a
-- real credit score requires a commercial agreement with a credit bureau
-- (TransUnion CIBIL, Experian, Equifax, or CRIF Highmark) or a fintech
-- data aggregator that resells bureau access (e.g. Karza, Perfios, Setu,
-- Decentro, Signzy). Until that agreement and API integration exist,
-- staff pull the score manually through their own authorized bureau
-- access and send the result to the customer via the existing Messages
-- feature — same manual-fulfillment pattern already used for the whole
-- loan workflow (no live bank APIs either, per the original V1 scope).
--
-- category = 'Credit Score' is deliberately its own category, distinct
-- from Loan/Insurance/Account — it's a value-added tool, not a partner
-- product, so it does NOT appear in the homepage flowchart (which only
-- ever renders those 3 categories) but does appear in the "Start an
-- application" product grid like everything else.
-- ============================================================================

insert into products (slug, name, short_description, icon, category, display_order, workflow_stages, required_documents, form_schema, assigned_team)
values (
  'cibil-score-check',
  'Free CIBIL Score Check',
  'Get your credit score checked by our team at no cost — no impact on your score.',
  'Gauge',
  'Credit Score',
  0,
  '["Requested","Checked by Team","Result Shared"]'::jsonb,
  '[]'::jsonb,
  '[
    {"key":"pan_number","label":"PAN Number","type":"text","required":true,"step":1},
    {"key":"date_of_birth","label":"Date of Birth","type":"date","required":true,"step":1},
    {"key":"consent","label":"I authorize Finlyst to check my credit score with authorized credit bureaus using my PAN and date of birth, for this purpose only.","type":"checkbox","required":true,"step":1}
  ]'::jsonb,
  'Credit Score Desk'
);
