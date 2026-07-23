-- ============================================================================
-- Private storage bucket for KYC/financial documents.
-- Path convention: {application_id}/{doc_key}/{filename}
-- Never public — always accessed via short-lived signed URLs.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Owner of the parent application (matched via path's first segment) or
-- staff can read/write. Path segments: storage.foldername(name) -> array.
create policy "documents_bucket_select"
on storage.objects for select
using (
  bucket_id = 'documents'
  and (
    is_staff()
    or exists (
      select 1 from applications a
      where a.id::text = (storage.foldername(name))[1]
      and a.user_id = auth.uid()
    )
  )
);

create policy "documents_bucket_insert"
on storage.objects for insert
with check (
  bucket_id = 'documents'
  and (
    is_staff()
    or exists (
      select 1 from applications a
      where a.id::text = (storage.foldername(name))[1]
      and a.user_id = auth.uid()
    )
  )
);

create policy "documents_bucket_delete_staff"
on storage.objects for delete
using (bucket_id = 'documents' and is_staff());
