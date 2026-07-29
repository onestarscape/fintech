import { ContentPage } from "@/components/shared/content-page";

export const metadata = {
  title: "FAQs — Finlyst",
  description: "Answers to common questions about applying through Finlyst.",
};


const FAQS = [
  {
    q: "Is Finlyst a bank?",
    a: "No. Finlyst is a lead-generation and application-facilitation platform. Loans, insurance, and accounts are issued solely by our partner banks, NBFCs, and insurers.",
  },
  {
    q: "Does applying cost anything?",
    a: "No — creating an account and submitting an application through Finlyst is free.",
  },
  {
    q: "How long does approval take?",
    a: "It depends on the product and partner institution. You can track live status in your dashboard at every stage.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Documents are stored in an encrypted, access-controlled system and are only visible to you and your assigned relationship manager.",
  },
];

export default function FAQsPage() {
  return (
    <ContentPage eyebrow="Support" title="Frequently asked questions">
      <div className="!mt-8 divide-y divide-line">
        {FAQS.map((item) => (
          <div key={item.q} className="py-5 first:pt-0">
            <p className="font-medium text-ink">{item.q}</p>
            <p className="mt-2 text-sm text-muted">{item.a}</p>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
