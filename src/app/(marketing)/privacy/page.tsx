import { ContentPage } from "@/components/shared/content-page";

export const metadata = {
  title: "Privacy Policy — Finlyst",
  description: "How Finlyst collects, uses, and protects your data.",
};


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
      <p>
        <strong>Document storage:</strong> uploaded documents are stored
        encrypted and are only accessible to you and your assigned
        relationship manager. You can permanently delete your account,
        applications, and every uploaded document — including the actual
        files, not just the records — from Profile → Danger zone.
      </p>
    </ContentPage>
  );
}
