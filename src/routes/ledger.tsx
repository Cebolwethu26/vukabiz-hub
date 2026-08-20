import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, Search, Wallet, Receipt } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ledgerQuery, type LedgerRow } from "@/lib/api";
import { shortDate, zar, zarExact } from "@/lib/format";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Public Transparency Ledger — VukaBiz Enterprise Hub" },
      {
        name: "description",
        content:
          "Every VukaBiz community fund contribution, grant disbursement, recipient business and vendor, published openly.",
      },
      { property: "og:title", content: "Public Transparency Ledger — VukaBiz" },
      {
        property: "og:description",
        content: "Search every disbursement, recipient and vendor in the VukaBiz community fund.",
      },
    ],
  }),
  component: LedgerPage,
});

const TYPE_LABEL: Record<LedgerRow["type"], string> = {
  contribution: "Inflow",
  disbursement: "Grant disbursement",
  overhead: "Operational overhead",
};

function LedgerPage() {
  const { data = [], isLoading } = useQuery(ledgerQuery);
  const [term, setTerm] = useState("");
  const [type, setType] = useState<string>("all");

  const totals = useMemo(() => {
    const sum = (t: LedgerRow["type"]) =>
      data.filter((r) => r.type === t).reduce((a, r) => a + Number(r.amount), 0);
    const inflow = sum("contribution");
    const out = sum("disbursement");
    const ops = sum("overhead");
    return { inflow, out, ops, balance: inflow - out - ops };
  }, [data]);

  const rows = useMemo(() => {
    const q = term.trim().toLowerCase();
    return data.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (!q) return true;
      return [r.recipient_business, r.vendor_name, r.description, r.reference]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, term, type]);

  return (
    <AppShell
      title="Public Transparency Ledger"
      description="Open to everyone — no account required."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total inflows" value={zar(totals.inflow)} icon={ArrowUpRight} tone="accent" />
        <StatCard label="Grants disbursed" value={zar(totals.out)} icon={ArrowDownRight} />
        <StatCard label="Operational overheads" value={zar(totals.ops)} icon={Receipt} />
        <StatCard
          label="Available balance"
          value={zar(totals.balance)}
          icon={Wallet}
          tone="accent"
          delta={`${((totals.ops / (totals.inflow || 1)) * 100).toFixed(1)}% overhead ratio`}
        />
      </div>

      <section className="surface-card mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search business, vendor or reference…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="All entries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entries</SelectItem>
              <SelectItem value="contribution">Inflows</SelectItem>
              <SelectItem value="disbursement">Grant disbursements</SelectItem>
              <SelectItem value="overhead">Operational overheads</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient business</TableHead>
                <TableHead>Vendor paid</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Loading ledger…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No entries match your search.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {shortDate(r.occurred_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.type === "contribution" ? "default" : "secondary"}>
                        {TYPE_LABEL[r.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{r.recipient_business ?? "—"}</TableCell>
                    <TableCell>{r.vendor_name ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.reference ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold">
                      {r.type === "contribution" ? "+" : "−"}
                      {zarExact(Number(r.amount))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </AppShell>
  );
}
