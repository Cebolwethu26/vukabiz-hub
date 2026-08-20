import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, BadgeCheck, HandCoins, Users, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ledgerQuery, myApplicationsQuery, myBusinessesQuery } from "@/lib/api";
import { monthLabel, shortDate, zar } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VukaBiz Enterprise Hub" },
      {
        name: "description",
        content: "Capital raised, approved grants, verified entities and community fund activity.",
      },
      { property: "og:title", content: "Dashboard — VukaBiz Enterprise Hub" },
      { property: "og:description", content: "Live metrics for the VukaBiz community fund." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: ledger = [] } = useQuery(ledgerQuery);
  const { data: businesses = [] } = useQuery(myBusinessesQuery);
  const { data: applications = [] } = useQuery(myApplicationsQuery);

  const metrics = useMemo(() => {
    const sum = (t: string) =>
      ledger.filter((r) => r.type === t).reduce((a, r) => a + Number(r.amount), 0);
    return {
      raised: sum("contribution"),
      disbursed: sum("disbursement"),
      grants: ledger.filter((r) => r.type === "disbursement").length,
      verified: businesses.filter((b) => b.verification === "verified").length,
    };
  }, [ledger, businesses]);

  const chartData = useMemo(() => {
    const buckets = new Map<string, { month: string; contributions: number; distributions: number }>();
    [...ledger]
      .sort((a, b) => +new Date(a.occurred_at) - +new Date(b.occurred_at))
      .forEach((r) => {
        const key = monthLabel(r.occurred_at);
        const row = buckets.get(key) ?? { month: key, contributions: 0, distributions: 0 };
        if (r.type === "contribution") row.contributions += Number(r.amount);
        else row.distributions += Number(r.amount);
        buckets.set(key, row);
      });
    return [...buckets.values()];
  }, [ledger]);

  const activity = useMemo(() => ledger.slice(0, 6), [ledger]);

  return (
    <AppShell title="Dashboard" description="Overview metrics and community fund activity">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total capital raised"
          value={zar(metrics.raised)}
          icon={Banknote}
          tone="accent"
          delta="Community micro-contributions"
        />
        <StatCard label="Approved grants" value={String(metrics.grants)} icon={HandCoins} delta={`${zar(metrics.disbursed)} disbursed`} />
        <StatCard label="Verified entities" value={String(metrics.verified)} icon={BadgeCheck} tone="accent" />
        <StatCard label="Active mentors" value="24" icon={Users} delta="Across 6 provinces" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <section className="surface-card p-5 xl:col-span-2">
          <h2 className="font-display text-lg font-semibold">Pool contributions vs. distributions</h2>
          <p className="text-sm text-muted-foreground">Monthly movement of the community fund</p>
          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v: number) => `R${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(v: number) => zar(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Legend />
                <Bar dataKey="contributions" name="Contributions" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="distributions" name="Distributions" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="font-display text-lg font-semibold">Net pool trend</h2>
          <p className="text-sm text-muted-foreground">Contributions less distributions</p>
          <div className="mt-5 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  formatter={(v: number) => zar(v)}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="contributions"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 rounded-lg bg-secondary p-4">
            <p className="text-sm font-medium">Your portfolio</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {businesses.length} business{businesses.length === 1 ? "" : "es"} · {applications.length}{" "}
              grant application{applications.length === 1 ? "" : "s"}
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link to="/onboarding">
                Manage onboarding <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <section className="surface-card mt-6 p-5">
        <h2 className="font-display text-lg font-semibold">Activity feed</h2>
        <ul className="mt-4 divide-y divide-border">
          {activity.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.description}</p>
                <p className="text-xs text-muted-foreground">
                  {shortDate(r.occurred_at)}
                  {r.vendor_name ? ` · vendor: ${r.vendor_name}` : ""}
                </p>
              </div>
              <Badge variant={r.type === "contribution" ? "default" : "secondary"}>
                {zar(Number(r.amount))}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
