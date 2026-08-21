import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HandCoins, Plus, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import {
  approvalsQuery,
  ledgerQuery,
  myApplicationsQuery,
  myBusinessesQuery,
  myRolesQuery,
} from "@/lib/api";
import { shortDate, zar } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/fund")({
  head: () => ({
    meta: [
      { title: "Grant & Micro-Fund Portal — VukaBiz" },
      {
        name: "description",
        content:
          "Track the R10/month community micro-fund, submit vendor line-item grant requests and follow trustee multi-signature approvals.",
      },
      { property: "og:title", content: "Grant & Micro-Fund Portal — VukaBiz" },
      {
        property: "og:description",
        content: "Community micro-fund contributions, grant requests and trustee approvals.",
      },
    ],
  }),
  component: FundPage,
});

const MONTHLY_CONTRIBUTION = 10;
const POOL_TARGET = 250000;
const REQUIRED_APPROVALS = 3;

type LineItem = { description: string; quantity: number; unit_cost: number };

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/15 text-primary",
  under_review: "bg-primary/15 text-primary",
  approved: "bg-accent/20 text-accent-foreground",
  rejected: "bg-destructive/15 text-destructive",
  disbursed: "bg-accent/20 text-accent-foreground",
};

function FundPage() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: ledger = [] } = useQuery(ledgerQuery);
  const { data: businesses = [] } = useQuery(myBusinessesQuery);
  const { data: applications = [] } = useQuery(myApplicationsQuery);
  const { data: approvals = [] } = useQuery(approvalsQuery);
  const { data: roles = [] } = useQuery(myRolesQuery);

  const isTrustee = roles.includes("trustee") || roles.includes("admin");

  const pool = useMemo(() => {
    const contributions = ledger
      .filter((r) => r.type === "contribution")
      .reduce((a, r) => a + Number(r.amount), 0);
    const disbursed = ledger
      .filter((r) => r.type === "disbursement")
      .reduce((a, r) => a + Number(r.amount), 0);
    return {
      contributions,
      disbursed,
      available: contributions - disbursed,
      members: Math.max(1, Math.round(contributions / MONTHLY_CONTRIBUTION / 12)),
      progress: Math.min(100, (contributions / POOL_TARGET) * 100),
    };
  }, [ledger]);

  const grantReady = businesses.filter((b) => b.route === "grant_ready");

  const [businessId, setBusinessId] = useState("");
  const [title, setTitle] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorCategory, setVendorCategory] = useState("equipment");
  const [purpose, setPurpose] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_cost: 0 },
  ]);

  const total = items.reduce((a, i) => a + Number(i.quantity || 0) * Number(i.unit_cost || 0), 0);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  const submitApplication = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be signed in.");
      if (!businessId) throw new Error("Select a grant-ready business.");
      if (!title.trim() || !vendorName.trim()) throw new Error("Title and vendor are required.");
      if (total <= 0) throw new Error("Add at least one line item with a cost.");
      const { error } = await supabase.from("grant_applications").insert({
        applicant_id: user.id,
        business_id: businessId,
        title: title.trim(),
        vendor_name: vendorName.trim(),
        vendor_category: vendorCategory,
        purpose: purpose.trim() || null,
        amount_requested: total,
        line_items: items as unknown as never,
        status: "submitted",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Grant application submitted for trustee review.");
      setTitle("");
      setVendorName("");
      setPurpose("");
      setItems([{ description: "", quantity: 1, unit_cost: 0 }]);
      queryClient.invalidateQueries({ queryKey: ["grant_applications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approve = useMutation({
    mutationFn: async (applicationId: string) => {
      if (!user) throw new Error("You must be signed in.");
      const { error } = await supabase.from("trustee_approvals").insert({
        application_id: applicationId,
        trustee_id: user.id,
        trustee_name: user.email ?? null,
        approved: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Approval signature recorded.");
      queryClient.invalidateQueries({ queryKey: ["trustee_approvals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell
      title="Grant & Micro-Fund Portal"
      description="Community capital pool, vendor-direct grant requests and trustee governance."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pool contributions" value={zar(pool.contributions)} icon={HandCoins} />
        <StatCard label="Disbursed to date" value={zar(pool.disbursed)} icon={CheckCircle2} />
        <StatCard label="Available capital" value={zar(pool.available)} icon={HandCoins} />
        <StatCard label="Est. contributing members" value={pool.members.toString()} icon={ShieldCheck} />
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">R10 / month micro-contribution pool</h2>
            <p className="text-sm text-muted-foreground">
              Every member contributes R{MONTHLY_CONTRIBUTION} monthly toward the community fund target.
            </p>
          </div>
          <p className="font-display text-2xl font-bold text-accent">
            {zar(pool.contributions)}{" "}
            <span className="text-sm font-medium text-muted-foreground">of {zar(POOL_TARGET)}</span>
          </p>
        </div>
        <Progress value={pool.progress} className="mt-4 h-3" />
        <p className="mt-2 text-xs text-muted-foreground">
          {pool.progress.toFixed(1)}% of the annual pool target reached.
        </p>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold">New grant application</h2>
          <p className="text-sm text-muted-foreground">
            Funds are paid directly to vendors — request equipment, stock or licences per line item.
          </p>

          {grantReady.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No grant-ready business yet. Complete{" "}
              <Link to="/onboarding" className="font-medium text-primary underline">
                verification & onboarding
              </Link>{" "}
              to unlock grant applications.
            </div>
          ) : (
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitApplication.mutate();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business</Label>
                  <Select value={businessId} onValueChange={setBusinessId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business" />
                    </SelectTrigger>
                    <SelectContent>
                      {grantReady.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Request title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Bakery oven upgrade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor name</Label>
                  <Input
                    id="vendor"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Highveld Catering Supplies"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vendor category</Label>
                  <Select value={vendorCategory} onValueChange={setVendorCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipment supplier</SelectItem>
                      <SelectItem value="stock">Stock / inventory</SelectItem>
                      <SelectItem value="licenses">Licences & compliance</SelectItem>
                      <SelectItem value="services">Professional services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Vendor line items</Label>
                {items.map((item, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem_auto]">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                      placeholder="Item description"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                      aria-label="Quantity"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={item.unit_cost}
                      onChange={(e) => updateItem(index, { unit_cost: Number(e.target.value) })}
                      aria-label="Unit cost in rand"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove line item"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setItems((prev) => [...prev, { description: "", quantity: 1, unit_cost: 0 }])
                  }
                >
                  <Plus className="size-4" /> Add line item
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose & expected impact</Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  placeholder="How this funding grows the business and creates jobs."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <p className="font-display text-xl font-bold">
                  Total requested: <span className="text-accent">{zar(total)}</span>
                </p>
                <Button type="submit" disabled={submitApplication.isPending}>
                  {submitApplication.isPending ? "Submitting…" : "Submit application"}
                </Button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold">Trustee approval panel</h2>
          <p className="text-sm text-muted-foreground">
            Multi-signature governance — {REQUIRED_APPROVALS} of {REQUIRED_APPROVALS} trustee
            signatures required before disbursement.
          </p>

          <div className="mt-4 space-y-3">
            {applications.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No applications yet.
              </p>
            ) : (
              applications.map((app) => {
                const signatures = approvals.filter(
                  (a) => a.application_id === app.id && a.approved,
                );
                const signed = signatures.length;
                const alreadySigned = signatures.some((a) => a.trustee_id === user?.id);
                return (
                  <article key={app.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium">{app.title}</h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {app.vendor_name} · {shortDate(app.created_at)}
                        </p>
                      </div>
                      <Badge className={STATUS_TONE[app.status] ?? "bg-muted"}>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <p className="mt-2 font-display text-lg font-bold">
                      {zar(Number(app.amount_requested))}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      {Array.from({ length: REQUIRED_APPROVALS }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-2 flex-1 rounded-full ${i < signed ? "bg-accent" : "bg-muted"}`}
                        />
                      ))}
                      <span className="text-xs font-medium text-muted-foreground">
                        {signed}/{REQUIRED_APPROVALS}
                      </span>
                    </div>

                    {signatures.length > 0 ? (
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        Signed by {signatures.map((s) => s.trustee_name ?? "Trustee").join(", ")}
                      </p>
                    ) : null}

                    {isTrustee ? (
                      <Button
                        className="mt-3 w-full"
                        size="sm"
                        variant={alreadySigned ? "outline" : "default"}
                        disabled={alreadySigned || signed >= REQUIRED_APPROVALS || approve.isPending}
                        onClick={() => approve.mutate(app.id)}
                      >
                        <ShieldCheck className="size-4" />
                        {alreadySigned ? "You have signed" : "Add trustee signature"}
                      </Button>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
