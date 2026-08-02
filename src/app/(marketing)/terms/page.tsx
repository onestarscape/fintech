import { ContentPage } from "@/components/shared/content-page";

export const metadata = {
  title: "Terms & Conditions — Fast Up Loans",
  description: "The terms governing use of the Fast Up Loans platform.",
};


export default function TermsPage() {
  return (
    <ContentPage eyebrow="Legal" title="Terms & Conditions">
      <p>
        <strong>Placeholder — replace before launch.</strong> This page must
        be reviewed by counsel before go-live, particularly the sections
        clarifying that Fast Up Loans facilitates applications and does not itself
        lend, underwrite, or issue policies — approval and terms are decided
        solely by the partner bank, NBFC, or insurer.
      </p>
      <p>
        Sections to include at minimum: platform role and limitations, user
        obligations (accuracy of information), fees (none in V1), dispute
        resolution, and governing law.
      </p>
    </ContentPage>
  );
}
