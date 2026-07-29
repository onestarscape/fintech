-- ============================================================================
-- Update 11 — the last 3 loan products go live: Vehicle Loan, Education
-- Loan, Gold Loan. With this, every product originally scoped for the
-- platform (Loans + Insurance + Bank Accounts) is a real, active row —
-- nothing left running off a hardcoded placeholder list anywhere.
-- ============================================================================

insert into products (slug, name, short_description, icon, category, display_order, workflow_stages, required_documents, form_schema, assigned_team)
values
(
  'vehicle-loan',
  'Vehicle Loan',
  'Finance a new or used car, two-wheeler, or commercial vehicle through our partner banks.',
  'Car',
  'Loan',
  11,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Approved","Disbursed","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},
    {"key":"driving_license","label":"Driving License","required":false,"section":"Identity Proof"},

    {"key":"salary_slips","label":"Salary Slips (Last 3 Months)","required":true,"section":"Income Proof"},
    {"key":"itr","label":"ITR (Last 2 Years, if self-employed)","required":false,"section":"Income Proof"},

    {"key":"bank_statement","label":"Bank Statement (Last 3 Months)","required":true,"section":"Bank Documents"},

    {"key":"vehicle_quotation","label":"Vehicle Quotation / Proforma Invoice","required":true,"section":"Vehicle Documents"}
  ]'::jsonb,
  '[
    {"key":"vehicle_type","label":"Vehicle Type","type":"select","options":["New Car","Used Car","Two-Wheeler","Commercial Vehicle"],"required":true,"step":1},
    {"key":"vehicle_cost","label":"Vehicle Cost","type":"number","required":true,"step":1},
    {"key":"loan_amount","label":"Loan Amount Required","type":"number","required":true,"step":1}
  ]'::jsonb,
  'Vehicle Loan Desk'
),
(
  'education-loan',
  'Education Loan',
  'Fund higher education in India or abroad with our partner banks and NBFCs.',
  'GraduationCap',
  'Loan',
  12,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Approved","Disbursed","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card (Student & Co-applicant)","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card (Student & Co-applicant)","required":true,"section":"Identity Proof"},

    {"key":"admission_letter","label":"Admission Letter","required":true,"section":"Academic Documents"},
    {"key":"fee_structure","label":"Fee Structure / Fee Receipt","required":true,"section":"Academic Documents"},
    {"key":"marksheets","label":"Academic Marksheets (10th / 12th / Graduation)","required":true,"section":"Academic Documents"},

    {"key":"co_applicant_income","label":"Co-applicant Salary Slips / ITR","required":true,"section":"Income Proof"},

    {"key":"bank_statement","label":"Bank Statement (Last 6 Months)","required":true,"section":"Bank Documents"}
  ]'::jsonb,
  '[
    {"key":"institution_name","label":"Institution Name","type":"text","required":true,"step":1},
    {"key":"course_name","label":"Course Name","type":"text","required":true,"step":1},
    {"key":"course_duration_years","label":"Course Duration (Years)","type":"number","required":true,"step":1},
    {"key":"loan_amount","label":"Loan Amount Required","type":"number","required":true,"step":2}
  ]'::jsonb,
  'Education Loan Desk'
),
(
  'gold-loan',
  'Gold Loan',
  'Quick loans against your gold jewellery from our partner banks and NBFCs.',
  'Coins',
  'Loan',
  13,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Approved","Disbursed","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true,"section":"Identity Proof"},
    {"key":"aadhaar","label":"Aadhaar Card","required":true,"section":"Identity Proof"},
    {"key":"gold_ownership_proof","label":"Gold Ownership Proof / Purchase Invoice","required":false,"section":"Gold Details"},
    {"key":"gold_photographs","label":"Photographs of Gold Jewellery","required":false,"section":"Gold Details"}
  ]'::jsonb,
  '[
    {"key":"gold_weight_grams","label":"Approximate Gold Weight (grams)","type":"number","required":true,"step":1},
    {"key":"loan_amount","label":"Loan Amount Required","type":"number","required":true,"step":1},
    {"key":"purpose","label":"Purpose","type":"select","options":["Business","Personal","Agriculture","Other"],"required":true,"step":1}
  ]'::jsonb,
  'Gold Loan Desk'
);
