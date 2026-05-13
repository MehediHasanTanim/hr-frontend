export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-medium text-brand-600">Next.js 14 foundation</p>
          <h1 className="text-4xl font-semibold text-neutral-900 text-balance">
            HR Frontend
          </h1>
          <p className="text-lg text-muted-foreground">
            A token-driven App Router baseline for production interface work.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-success">Ready</p>
            <h2 className="mt-2 text-xl font-semibold text-card-foreground">
              Typed routes
            </h2>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-warning">Configured</p>
            <h2 className="mt-2 text-xl font-semibold text-card-foreground">
              Design tokens
            </h2>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-info">Structured</p>
            <h2 className="mt-2 text-xl font-semibold text-card-foreground">
              Source layout
            </h2>
          </div>
        </div>
      </section>
    </main>
  );
}
