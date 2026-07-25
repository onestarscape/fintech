"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Timeline, type TimelineStep } from "@/components/shared/timeline";
import { leadCaptureSchema } from "@/lib/validations/lead";
import { createLead, createApplication } from "@/lib/actions/applications";
import type { Database, FormFieldDef } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

const FLOW_STAGES = ["Your details", "Product details", "Review & submit"];

export function ApplyFlow({ product }: { product: Product }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);

  const [leadData, setLeadData] = useState({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    requirement: "",
  });

  const schema = (product.form_schema ?? []) as FormFieldDef[];
  const [productData, setProductData] = useState<Record<string, string>>({});

  const timelineSteps: TimelineStep[] = FLOW_STAGES.map((label, i) => ({
    label,
    state: i < step ? "done" : i === step ? "current" : "upcoming",
  }));

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = leadCaptureSchema.safeParse(leadData);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    const result = await createLead(product.id, parsed.data);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setLeadId(result.lead!.id);
    setStep(1);
  }

  async function handleFinalSubmit() {
    if (!leadId) return;
    setSubmitting(true);
    setError(null);
    const result = await createApplication(leadId, product.id, productData);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/dashboard?submitted=${product.slug}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <p className="text-sm font-medium text-accent">{product.name}</p>
      <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight">
        Guided application
      </h1>

      <div className="mt-8">
        <Timeline steps={timelineSteps} orientation="horizontal" />
      </div>

      {error && (
        <div className="mt-6 rounded-[var(--radius-sm)] bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* STEP 0 — Lead capture (product-agnostic, always first) */}
      {step === 0 && (
        <form onSubmit={handleLeadSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={leadData.full_name}
              onChange={(e) => setLeadData({ ...leadData, full_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input
                id="phone"
                value={leadData.phone}
                onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={leadData.city}
                onChange={(e) => setLeadData({ ...leadData, city: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={leadData.email}
              onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="requirement">Tell us briefly what you need</Label>
            <textarea
              id="requirement"
              rows={3}
              value={leadData.requirement}
              onChange={(e) => setLeadData({ ...leadData, requirement: e.target.value })}
              className="flex w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent"
            />
          </div>
          <Button type="submit" variant="accent" size="lg" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Continue"}
          </Button>
        </form>
      )}

      {/* STEP 1 — Product-specific fields, entirely driven by form_schema */}
      {step === 1 && (
        <div className="mt-8 space-y-4">
          {schema.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === "select" ? (
                <Select
                  id={field.key}
                  required={field.required}
                  value={productData[field.key] ?? ""}
                  onChange={(e) =>
                    setProductData({ ...productData, [field.key]: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={field.key}
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  required={field.required}
                  value={productData[field.key] ?? ""}
                  onChange={(e) =>
                    setProductData({ ...productData, [field.key]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="lg" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button variant="accent" size="lg" className="flex-1" onClick={() => setStep(2)}>
              Review
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — Review & submit. Document upload happens post-submit,
          from the customer dashboard, once the application record exists. */}
      {step === 2 && (
        <div className="mt-8 space-y-6">
          <div className="rounded-[var(--radius-lg)] border border-line p-5">
            <p className="text-sm font-medium">{leadData.full_name}</p>
            <p className="text-sm text-muted">{leadData.phone} · {leadData.city}</p>
            <div className="mt-4 space-y-1.5 border-t border-line pt-4">
              {schema.map((f) => (
                <p key={f.key} className="text-sm text-muted">
                  <span className="text-ink">{f.label}:</span> {productData[f.key] || "—"}
                </p>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted">
            After submitting, you&apos;ll upload required documents from your
            dashboard and a relationship manager will be assigned.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="accent"
              size="lg"
              className="flex-1"
              disabled={submitting}
              onClick={handleFinalSubmit}
            >
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
