import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center">
          <Image src="/fastuploans-logo.png" alt="Fast Up Loans" width={180} height={143} className="h-12 w-auto" priority />
        </Link>
        <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-surface p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
