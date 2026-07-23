-- ============================================================================
-- Seed: V1 launches with 3 products. Adding a 4th is a data insert, not a
-- deploy — that's the point of the Dynamic Product Engine.
-- ============================================================================

insert into products (slug, name, short_description, icon, category, display_order, workflow_stages, required_documents, form_schema, assigned_team)
values
(
  'home-loan',
  'Home Loan',
  'Finance your new home or balance transfer with the best rates from our partner banks.',
  'Home',
  'Loan',
  1,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Approved","Disbursed","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true},
    {"key":"aadhaar","label":"Aadhaar Card","required":true},
    {"key":"income_proof","label":"Salary Slips / ITR","required":true},
    {"key":"bank_statement","label":"Bank Statement (6 months)","required":true},
    {"key":"property_docs","label":"Property Documents","required":false}
  ]'::jsonb,
  '[
    {"key":"loan_amount","label":"Loan Amount Required","type":"number","required":true,"step":1},
    {"key":"employment_type","label":"Employment Type","type":"select","options":["Salaried","Self-Employed","Business Owner"],"required":true,"step":1},
    {"key":"monthly_income","label":"Monthly Income","type":"number","required":true,"step":1},
    {"key":"property_identified","label":"Have you identified a property?","type":"select","options":["Yes","No"],"required":true,"step":2}
  ]'::jsonb,
  'Home Loan Desk'
),
(
  'personal-loan',
  'Personal Loan',
  'Quick, unsecured personal loans for any need — approved fast, minimal paperwork.',
  'Wallet',
  'Loan',
  2,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Approved","Disbursed","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card","required":true},
    {"key":"aadhaar","label":"Aadhaar Card","required":true},
    {"key":"income_proof","label":"Salary Slips (3 months)","required":true},
    {"key":"bank_statement","label":"Bank Statement (3 months)","required":true}
  ]'::jsonb,
  '[
    {"key":"loan_amount","label":"Loan Amount Required","type":"number","required":true,"step":1},
    {"key":"purpose","label":"Purpose of Loan","type":"select","options":["Medical","Travel","Wedding","Debt Consolidation","Other"],"required":true,"step":1},
    {"key":"monthly_income","label":"Monthly Income","type":"number","required":true,"step":1}
  ]'::jsonb,
  'Personal Loan Desk'
),
(
  'business-loan',
  'Business Loan',
  'Working capital and growth financing for your business, from our NBFC and bank partners.',
  'Briefcase',
  'Loan',
  3,
  '["Lead Received","Documents Pending","Under Review","Sent to Partner","Approved","Disbursed","Rejected"]'::jsonb,
  '[
    {"key":"pan","label":"PAN Card (Business/Owner)","required":true},
    {"key":"gst","label":"GST Certificate","required":true},
    {"key":"bank_statement","label":"Bank Statement (12 months)","required":true},
    {"key":"itr","label":"Business ITR (2 years)","required":true}
  ]'::jsonb,
  '[
    {"key":"loan_amount","label":"Loan Amount Required","type":"number","required":true,"step":1},
    {"key":"business_type","label":"Business Type","type":"select","options":["Proprietorship","Partnership","Pvt Ltd","LLP"],"required":true,"step":1},
    {"key":"business_vintage","label":"Years in Business","type":"number","required":true,"step":1},
    {"key":"annual_turnover","label":"Annual Turnover","type":"number","required":true,"step":2}
  ]'::jsonb,
  'Business Loan Desk'
);

insert into partners (name, type, display_order) values
('Bank of Maharashtra', 'bank', 1),
('Union Bank of India', 'bank', 2),
('Bank of Baroda', 'bank', 3),
('SBI', 'bank', 4),
('HDFC Bank', 'bank', 5),
('ICICI Bank', 'bank', 6),
('Axis Bank', 'bank', 7),
('IDFC FIRST Bank', 'bank', 8),
('Kotak Mahindra Bank', 'bank', 9),
('Canara Bank', 'bank', 10),
('Federal Bank', 'bank', 11),
('Yes Bank', 'bank', 12),
('IndusInd Bank', 'bank', 13),
('Cholamandalam', 'nbfc', 14),
('Arka Fincap', 'nbfc', 15),
('Tata Capital', 'nbfc', 16),
('Bajaj Finance', 'nbfc', 17),
('Aditya Birla Finance', 'nbfc', 18),
('L&T Finance', 'nbfc', 19),
('Piramal Finance', 'nbfc', 20),
('Poonawalla Fincorp', 'nbfc', 21),
('Shriram Finance', 'nbfc', 22);
