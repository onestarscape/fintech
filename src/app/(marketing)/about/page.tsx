import { ContentPage } from "@/components/shared/content-page";

export default function AboutPage() {
  return (
    <ContentPage eyebrow="About" title="Finance, made simple.">
      <p>
        Finlyst helps people find and apply for home loans, business loans,
        insurance, and bank accounts — without visiting multiple banks or
        filling paper forms.
      </p>
      <p>
        We work with a curated network of partner banks, NBFCs, and insurers.
        You apply once through a guided flow, we route it correctly, and a
        relationship manager tracks it through to disbursal or issuance —
        with full visibility for you at every stage.
      </p>
      <p>
        Loans, insurance policies, and accounts are underwritten and issued
        solely by our partner institutions, subject to their own approval
        and terms. Finlyst facilitates the application; it is not a bank,
        NBFC, or insurer.
      </p>
    </ContentPage>
  );
}
