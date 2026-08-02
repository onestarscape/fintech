"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Admin gate credentials are a list of "username:password" pairs, so more
 * than one person can have their own separate login instead of everyone
 * sharing a single username/password. Configure via:
 *
 *   ADMIN_GATE_CREDENTIALS="alice:somePassword,bob:anotherPassword"
 *
 * The older single-pair vars (ADMIN_GATE_USERNAME / ADMIN_GATE_PASSWORD)
 * still work too, and are simply treated as one more entry in the list —
 * no need to remove them when adding ADMIN_GATE_CREDENTIALS.
 */
function getGateCredentials(): { username: string; password: string }[] {
  const pairs: { username: string; password: string }[] = [];

  const list = process.env.ADMIN_GATE_CREDENTIALS;
  if (list) {
    for (const entry of list.split(",")) {
      const [username, password] = entry.split(":").map((s) => s.trim());
      if (username && password) pairs.push({ username, password });
    }
  }

  const legacyUsername = process.env.ADMIN_GATE_USERNAME;
  const legacyPassword = process.env.ADMIN_GATE_PASSWORD;
  if (legacyUsername && legacyPassword) {
    pairs.push({ username: legacyUsername, password: legacyPassword });
  }

  return pairs;
}

export async function verifyAdminGate(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");

  const token = process.env.ADMIN_GATE_TOKEN;
  const credentials = getGateCredentials();

  if (!token || credentials.length === 0) {
    redirect(
      `/admin-gate?error=${encodeURIComponent("Admin gate is not configured yet — set ADMIN_GATE_CREDENTIALS and ADMIN_GATE_TOKEN.")}`
    );
  }

  const matched = credentials.some(
    (c) => c.username === username && c.password === password
  );

  if (!matched) {
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
