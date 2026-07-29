-- ============================================================================
-- 1) Expand and categorize document checklists for the 3 existing loan
--    products. Documents now carry a `section` (Identity Proof, Income
--    Proof, Bank Documents, Property Documents, etc.) so the UI can group
--    them instead of showing one long flat list.
-- ============================================================================

update products set required_documents = '[
  {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
  {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},
  {"key":"passport","label":"Passport","required":false,"section":"Identity Proof"},

  {"key":"salary_slips","label":"Salary Slips (Last 3 Months)","required":true,"section":"Income Proof"},
  {"key":"form16","label":"Form 16","required":true,"section":"Income Proof"},
  {"key":"itr","label":"ITR (Last 3 Years)","required":true,"section":"Income Proof"},

  {"key":"bank_statement","label":"Bank Statement / Passbook (Last 6 Months)","required":true,"section":"Bank Documents"},

  {"key":"electricity_bill","label":"Electricity (Light) Bill","required":true,"section":"Address Proof"},
  {"key":"utility_bill","label":"Any Other Utility Bill","required":false,"section":"Address Proof"},
  {"key":"maintenance_receipt","label":"Maintenance Receipt","required":false,"section":"Address Proof"},

  {"key":"sale_deed","label":"Sale Deed / Agreement to Sale","required":true,"section":"Property Documents"},
  {"key":"index_2","label":"Index II (Property Registration Document)","required":true,"section":"Property Documents"},
  {"key":"property_tax_receipt","label":"Property Tax Receipt","required":false,"section":"Property Documents"},
  {"key":"society_noc","label":"NOC from Society / Builder","required":false,"section":"Property Documents"}
]'::jsonb
where slug = 'home-loan';

update products set required_documents = '[
  {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
  {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},

  {"key":"salary_slips","label":"Salary Slips (Last 3 Months)","required":true,"section":"Income Proof"},
  {"key":"form16","label":"Form 16","required":false,"section":"Income Proof"},

  {"key":"bank_statement","label":"Bank Statement (Last 3 Months)","required":true,"section":"Bank Documents"}
]'::jsonb
where slug = 'personal-loan';

update products set required_documents = '[
  {"key":"pan","label":"PAN Card (Business/Owner)","required":true,"section":"Identity Proof"},
  {"key":"aadhaar","label":"Aadhaar Card (Owner)","required":true,"section":"Identity Proof"},

  {"key":"gst","label":"GST Certificate","required":true,"section":"Business Proof"},
  {"key":"itr","label":"Business ITR (Last 2 Years)","required":true,"section":"Income Proof"},

  {"key":"bank_statement","label":"Bank Statement (Last 12 Months)","required":true,"section":"Bank Documents"}
]'::jsonb
where slug = 'business-loan';

-- ============================================================================
-- 2) Bring Insurance and Bank Account products live — same Dynamic Product
--    Engine, just new configured rows. Each gets a sensible, categorized
--    document list and its own guided-flow fields.
-- ============================================================================

insert into products (slug, name, short_description, icon, category, display_order, workflow_stages, required_documents, form_schema, assigned_team)
values
(
  'life-insurance',
  'Life Insurance',
  'Protect your family''s future with a life cover from our partner insurers.',
  'ShieldCheck',
  'Insurance',
  4,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Policy Issued","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},
    {"key":"income_proof","label":"Salary Slips / ITR","required":true,"section":"Income Proof"},
    {"key":"nominee_id","label":"Nominee ID Proof","required":false,"section":"Nominee Details"}
  ]'::jsonb,
  '[
    {"key":"sum_assured","label":"Sum Assured Required","type":"number","required":true,"step":1},
    {"key":"policy_term_years","label":"Policy Term (Years)","type":"number","required":true,"step":1},
    {"key":"existing_policies","label":"Do you have existing life policies?","type":"select","options":["Yes","No"],"required":true,"step":1}
  ]'::jsonb,
  'Insurance Desk'
),
(
  'health-insurance',
  'Health Insurance',
  'Comprehensive medical cover for you and your family from trusted health insurers.',
  'ShieldCheck',
  'Insurance',
  5,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Policy Issued","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},
    {"key":"medical_reports","label":"Existing Medical Reports","required":false,"section":"Medical Documents"}
  ]'::jsonb,
  '[
    {"key":"cover_amount","label":"Cover Amount Required","type":"number","required":true,"step":1},
    {"key":"family_members_count","label":"Number of Family Members to Cover","type":"number","required":true,"step":1},
    {"key":"pre_existing_conditions","label":"Any pre-existing medical conditions?","type":"select","options":["Yes","No"],"required":true,"step":1}
  ]'::jsonb,
  'Insurance Desk'
),
(
  'motor-insurance',
  'Motor Insurance',
  'Insure your car or two-wheeler with our partner insurers — new policy or renewal.',
  'Car',
  'Insurance',
  6,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Policy Issued","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":false,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},
    {"key":"vehicle_rc","label":"Vehicle RC (Registration Certificate)","required":true,"section":"Vehicle Documents"},
    {"key":"driving_license","label":"Driving License","required":true,"section":"Vehicle Documents"},
    {"key":"previous_policy","label":"Previous Insurance Policy","required":false,"section":"Vehicle Documents"}
  ]'::jsonb,
  '[
    {"key":"vehicle_type","label":"Vehicle Type","type":"select","options":["Car","Two-Wheeler","Commercial Vehicle"],"required":true,"step":1},
    {"key":"vehicle_registration_number","label":"Vehicle Registration Number","type":"text","required":true,"step":1},
    {"key":"idv_amount","label":"Insured Declared Value (IDV), if known","type":"number","required":false,"step":1}
  ]'::jsonb,
  'Insurance Desk'
),
(
  'general-insurance',
  'General Insurance',
  'Home, travel, and property insurance cover from our partner insurers.',
  'ShieldCheck',
  'Insurance',
  7,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Policy Issued","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},
    {"key":"asset_proof","label":"Property / Asset Ownership Proof","required":false,"section":"Asset Documents"},
    {"key":"previous_policy","label":"Previous Policy (if renewing)","required":false,"section":"Asset Documents"}
  ]'::jsonb,
  '[
    {"key":"insurance_type","label":"Insurance Type","type":"select","options":["Home","Travel","Property","Other"],"required":true,"step":1},
    {"key":"sum_insured","label":"Sum Insured Required","type":"number","required":true,"step":1}
  ]'::jsonb,
  'Insurance Desk'
),
(
  'savings-account',
  'Savings Account',
  'Open a zero-hassle savings account with our partner banks.',
  'Landmark',
  'Account',
  8,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Account Opened","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},
    {"key":"utility_bill","label":"Utility Bill / Rent Agreement","required":false,"section":"Address Proof"},
    {"key":"photograph","label":"Passport-Size Photograph","required":true,"section":"Photograph"}
  ]'::jsonb,
  '[
    {"key":"initial_deposit","label":"Initial Deposit Amount","type":"number","required":false,"step":1},
    {"key":"account_purpose","label":"Account Purpose","type":"select","options":["Personal","Salary","Senior Citizen"],"required":true,"step":1}
  ]'::jsonb,
  'Accounts Desk'
),
(
  'current-account',
  'Current Account',
  'Business current accounts with our partner banks — built for daily transactions.',
  'Landmark',
  'Account',
  9,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Account Opened","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card (Authorized Signatory)","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card (Authorized Signatory)","required":true,"section":"Identity Proof"},
    {"key":"gst","label":"GST Certificate","required":true,"section":"Business Proof"},
    {"key":"business_registration","label":"Business Registration Certificate / Shop Act License","required":true,"section":"Business Proof"},
    {"key":"utility_bill","label":"Utility Bill (Business Address)","required":false,"section":"Address Proof"}
  ]'::jsonb,
  '[
    {"key":"business_name","label":"Business Name","type":"text","required":true,"step":1},
    {"key":"annual_turnover","label":"Annual Turnover","type":"number","required":true,"step":1}
  ]'::jsonb,
  'Accounts Desk'
),
(
  'corporate-banking',
  'Corporate Banking',
  'Banking solutions for companies and larger enterprises from our partner banks.',
  'Landmark',
  'Account',
  10,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Account Opened","Rejected"]'::jsonb,
  '[
    {"key":"incorporation_cert","label":"Certificate of Incorporation","required":true,"section":"Company Documents"},
    {"key":"moa_aoa","label":"Memorandum & Articles of Association (MOA/AOA)","required":true,"section":"Company Documents"},
    {"key":"board_resolution","label":"Board Resolution","required":true,"section":"Company Documents"},
    {"key":"director_kyc","label":"PAN & Aadhaar of Directors / Signatories","required":true,"section":"Identity Proof"},
    {"key":"gst","label":"GST Certificate","required":true,"section":"Business Proof"}
  ]'::jsonb,
  '[
    {"key":"company_name","label":"Company Name","type":"text","required":true,"step":1},
    {"key":"company_type","label":"Company Type","type":"select","options":["Private Limited","Public Limited","LLP"],"required":true,"step":1},
    {"key":"annual_turnover","label":"Annual Turnover","type":"number","required":true,"step":1}
  ]'::jsonb,
  'Accounts Desk'
);
