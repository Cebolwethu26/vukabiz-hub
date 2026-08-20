import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, HandCoins, ScrollText, ArrowRight, CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VukaBiz Enterprise Hub — Verified SMEs, transparent funding" },
      {
        name: "description",
        content:
          "Register your SME, get verified, access community micro-fund grants and follow every rand on a public transparency ledger.",
      },
      { property: "og:title", content: "VukaBiz Enterprise Hub" },
      {
        property: "og:description",
        content:
          "Verification, grants and a public audit ledger for South African small businesses.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verification & onboarding",
    body: "CIPC and SARS capture with an automated route engine that places each business on the right pathway instantly.",
  },
  {
    icon: HandCoins,
    title: "Community micro-fund",
    body: "R10 a month from many builds a real pool. Grants pay vendors directly — never cash in hand.",
  },
  {
    icon: ScrollText,
    title: "Public audit ledger",
    body: "Every disbursement, recipient and vendor is published. Trustees sign off 3-of-3 before a rand moves.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/ledger">Public ledger</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="hero-gradient">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            <CheckCircle2 className="size-3.5" /> Trustee governed
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
            Verified small businesses. Transparent community capital.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">
            VukaBiz Enterprise Hub takes an SME from unregistered hustle to grant-ready enterprise —
            with every cent of the community fund published in a public audit ledger.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/login">
                Register your business <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/ledger">View the public ledger</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">How the hub works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="surface-card p-6">
              <div className="grid size-10 place-items-center rounded-lg bg-accent/12 text-accent">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} VukaBiz Enterprise Hub. Community capital, publicly audited.
        </div>
      </footer>
    </div>
  );
}
