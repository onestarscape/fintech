import { ContentPage } from "@/components/shared/content-page";

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Legal" title="Privacy Policy">
      <p>
        <strong>Placeholder — replace before launch.</strong> This page must
        be reviewed by counsel before go-live, particularly the sections on
        consent to share applicant data with partner banks, NBFCs, and
        insurers, and on retention of KYC documents (PAN, Aadhaar, bank
        statements, etc).
      </p>
      <p>
        Sections to include at minimum: what data is collected, how it is
        used, which third parties (named partner institutions) it is shared
        with and why, how long documents are retained, how a user can
        request deletion, and contact details for privacy queries.
      </p>
    </ContentPage>
  );
}
