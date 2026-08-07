-- ============================================================================
-- Update 18 — document rejection with a visible reason.
--
-- Previously `documents.verified` was just true/false — if staff rejected
-- a document, the customer had no way to know it was rejected, let alone
-- why, so they couldn't fix and re-upload it. Replaced with a proper
-- status (pending/verified/rejected) plus a rejection_reason the customer
-- can see directly on their application.
-- ============================================================================

create type document_status as enum ('pending', 'verified', 'rejected');

alter table documents add column status document_status not null default 'pending';
alter table documents add column rejection_reason text;

update documents set status = 'verified' where verified = true;

alter table documents drop column verified;

-- Clean up any duplicates that already exist from a latent bug (doc_key
-- had no uniqueness constraint, so a "replace" upload silently created a
-- second row instead of updating the first), keeping only the most
-- recently uploaded row per (application_id, doc_key).
delete from documents d
using documents d2
where d.application_id = d2.application_id
  and d.doc_key = d2.doc_key
  and d.uploaded_at < d2.uploaded_at;

alter table documents add constraint documents_application_doc_key_unique
  unique (application_id, doc_key);
