import { RegisterWizard } from "@/features/auth/components/RegisterWizard";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <section className="w-full max-w-3xl rounded-lg border bg-background p-6 shadow-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">Set up the company and first admin user.</p>
        </div>
        <RegisterWizard />
      </section>
    </main>
  );
}
