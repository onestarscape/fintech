import { LoginForm } from "@/components/shared/login-form";

export default async function PartnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { error, redirect } = await searchParams;

  return (
    <LoginForm
      heading="Partner login"
      subtitle="For agents, connectors & builders — refer customers and track your commissions."
      error={error}
      redirect={redirect}
      signupPrompt="New partner?"
      signupLabel="Create an account to apply"
    />
  );
}
