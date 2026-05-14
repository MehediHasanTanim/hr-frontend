import Link from "next/link";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold">Reset access</h1>
          <p className="text-sm text-muted-foreground">We will send a reset link when the email exists.</p>
        </div>
        <ForgotPasswordForm />
        <Link className="mt-4 block text-center text-sm text-primary hover:underline" href="/login">
          Back to login
        </Link>
      </section>
    </main>
  );
}
