import type { Metadata } from "next";
import { EmiCalculator } from "@/components/shared/emi-calculator";

export const metadata: Metadata = {
  title: "EMI Calculator — Finlyst",
  description: "Estimate your monthly EMI for a home, personal, or business loan.",
};

export default function EmiCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-medium text-accent">Free tool</p>
      <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">
        EMI Calculator
      </h1>
      <p className="mt-3 max-w-lg text-base text-muted">
        Adjust the loan amount, interest rate, and tenure to estimate your
        monthly payment before you apply.
      </p>
      <div className="mt-10">
        <EmiCalculator />
      </div>
    </div>
  );
}
