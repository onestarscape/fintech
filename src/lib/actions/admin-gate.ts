"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyAdminGate(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");

  const expectedUsername = process.env.ADMIN_GATE_USERNAME;
  const expectedPassword = process.env.ADMIN_GATE_PASSWORD;
  const token = process.env.ADMIN_GATE_TOKEN;

  if (!expectedUsername || !expectedPassword || !token) {
    redirect(
      `/admin-gate?error=${encodeURIComponent("Admin gate is not configured yet — set ADMIN_GATE_USERNAME, ADMIN_GATE_PASSWORD, and ADMIN_GATE_TOKEN.")}`
    );
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    redirect(`/admin-gate?error=${encodeURIComponent("Incorrect username or password.")}`);
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_gate", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect(redirectTo);
}
