import { z } from "zod";

// Step 1 of every product's guided flow — captured before anything else,
// per the brief. This is intentionally product-agnostic.
export const leadCaptureSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  city: z.string().min(2, "Enter your city"),
  requirement: z.string().optional(),
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
