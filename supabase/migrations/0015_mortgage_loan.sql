-- ============================================================================
-- Update 26 — Mortgage Loan (Loan Against Property).
-- The Wix marketing site advertises this as one of its 4 core loan
-- products ("MORTGAGE LOANS"), but it didn't exist here yet — this is
-- exactly the kind of Wix/portal drift worth catching early.
-- ============================================================================

insert into products (slug, name, short_description, icon, category, display_order, workflow_stages, required_documents, form_schema, assigned_team)
values (
  'mortgage-loan',
  'Mortgage Loan',
  'Unlock funds against your property — loan against property from our partner banks and NBFCs.',
  'Home',
  'Loan',
  14,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Approved","Disbursed","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},

    {"key":"income_proof","label":"Salary Slips / ITR (Last 2 Years)","required":true,"section":"Income Proof"},

    {"key":"bank_statement","label":"Bank Statement (Last 6 Months)","required":true,"section":"Bank Documents"},

    {"key":"sale_deed","label":"Sale Deed / Title Documents","required":true,"section":"Property Documents"},
    {"key":"index_2","label":"Index II (Property Registration Document)","required":true,"section":"Property Documents"},
    {"key":"property_tax_receipt","label":"Property Tax Receipt","required":false,"section":"Property Documents"}
  ]'::jsonb,
  '[
    {"key":"loan_amount","label":"Loan Amount Required","type":"number","required":true,"step":1},
    {"key":"property_value","label":"Estimated Property Value","type":"number","required":true,"step":1},
    {"key":"property_type","label":"Property Type","type":"select","options":["Residential","Commercial","Industrial"],"required":true,"step":1}
  ]'::jsonb,
  'Mortgage Loan Desk'
);
