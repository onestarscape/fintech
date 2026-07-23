import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display block text-center text-lg font-semibold">
          Finlyst
        </Link>
        <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-surface p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
