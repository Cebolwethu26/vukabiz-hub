import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, GraduationCap, Rocket, Check, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { myBusinessesQuery } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Verification & Onboarding — VukaBiz Enterprise Hub" },
      {
        name: "description",
        content:
          "Register your SME with CIPC and SARS details and get routed automatically to upskilling or grant applications.",
      },
      { property: "og:title", content: "Verification & Onboarding — VukaBiz" },
      {
        property: "og:description",
        content: "Multi-step SME registration with an automated pathing engine.",
      },
    ],
  }),
  component: OnboardingPage,
});

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const STAGES = [
  { value: "idea", label: "Idea / pre-trading" },
  { value: "early", label: "Early stage — trading under 2 years" },
  { value: "growth", label: "Growth stage — trading 2+ years" },
  { value: "established", label: "Established — audited financials" },
];

const MODULES = [
  "Business registration & CIPC basics",
  "SARS tax compliance for micro-enterprise",
  "Bookkeeping and cash-flow discipline",
  "Pricing, costing and margin",
];

const STEPS = ["Business identity", "Compliance", "Stage & location", "Automated route"];

type Form = {
  name: string;
  cipc_number: string;
  sars_tax_pin: string;
  stage: string;
  sector: string;
  province: string;
  city: string;
  employees: string;
};

const EMPTY: Form = {
  name: "",
  cipc_number: "",
  sars_tax_pin: "",
  stage: "early",
  sector: "",
  province: "Gauteng",
  city: "",
  employees: "1",
};

function routeFor(form: Form) {
  const registered = form.cipc_number.trim().length > 0 && form.sars_tax_pin.trim().length > 0;
  const grownUp = form.stage === "growth" || form.stage === "established";
  return registered && grownUp
    ? ("grant_ready" as const)
    : ("upskilling" as const);
}

function OnboardingPage() {
  const qc = useQueryClient();
  const { data: businesses = [] } = useQuery(myBusinessesQuery);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const pathway = routeFor(form);

  const save = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("businesses").insert({
        owner_id: auth.user!.id,
        name: form.name,
        cipc_number: form.cipc_number || null,
        sars_tax_pin: form.sars_tax_pin || null,
        stage: form.stage as never,
        sector: form.sector || null,
        province: form.province,
        city: form.city || null,
        employees: Number(form.employees) || 0,
        is_registered: Boolean(form.cipc_number && form.sars_tax_pin),
        route: pathway,
        verification: pathway === "grant_ready" ? ("verified" as never) : ("pending" as never),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Business submitted and routed");
      qc.invalidateQueries({ queryKey: ["businesses"] });
      setForm(EMPTY);
      setStep(0);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canNext =
    step === 0 ? form.name.trim().length > 1 : step === 2 ? form.province.length > 0 : true;

  return (
    <AppShell
      title="Verification & Onboarding Hub"
      description="Register an SME and get an instant pathway decision"
    >
      <div className="grid gap-5 xl:grid-cols-3">
        <section className="surface-card p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">SME registration</h2>
              <p className="text-sm text-muted-foreground">
                Step {step + 1} of {STEPS.length} — {STEPS[step]}
              </p>
            </div>
            <Badge variant="secondary">{Math.round(((step + 1) / STEPS.length) * 100)}%</Badge>
          </div>
          <Progress className="mt-4" value={((step + 1) / STEPS.length) * 100} />

          <ol className="mt-5 flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  i < step
                    ? "bg-accent/12 text-accent"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-3" /> : null}
                {s}
              </li>
            ))}
          </ol>

          <div className="mt-6 space-y-4">
            {step === 0 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Registered / trading name</Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    placeholder="e.g. Food services, Logistics, ICT"
                    value={form.sector}
                    onChange={(e) => set("sector", e.target.value)}
                  />
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cipc">CIPC registration number</Label>
                  <Input
                    id="cipc"
                    placeholder="2021/123456/07 — leave blank if unregistered"
                    value={form.cipc_number}
                    onChange={(e) => set("cipc_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sars">SARS tax compliance PIN</Label>
                  <Input
                    id="sars"
                    placeholder="Leave blank if not yet issued"
                    value={form.sars_tax_pin}
                    onChange={(e) => set("sars_tax_pin", e.target.value)}
                  />
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="space-y-2">
                  <Label>Business stage</Label>
                  <Select value={form.stage} onValueChange={(v) => set("stage", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Select value={form.province} onValueChange={(v) => set("province", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City / township</Label>
                    <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp">Employees</Label>
                  <Input
                    id="emp"
                    type="number"
                    min={0}
                    value={form.employees}
                    onChange={(e) => set("employees", e.target.value)}
                  />
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <div
                className={cn(
                  "rounded-xl border p-5",
                  pathway === "grant_ready"
                    ? "border-accent/40 bg-accent/8"
                    : "border-warning/40 bg-warning/8",
                )}
              >
                <div className="flex items-center gap-2">
                  {pathway === "grant_ready" ? (
                    <Rocket className="size-5 text-accent" />
                  ) : (
                    <GraduationCap className="size-5 text-warning" />
                  )}
                  <h3 className="font-display text-lg font-semibold">
                    {pathway === "grant_ready"
                      ? "Growth Stage / Registered"
                      : "Early Stage / Unregistered"}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pathway === "grant_ready"
                    ? "Grant applications are unlocked. You can submit a vendor line-item request in the Grant & Micro-Fund portal."
                    : "Mandatory upskilling modules are assigned. Complete them to unlock grant applications."}
                </p>
                {pathway === "upskilling" ? (
                  <ul className="mt-4 space-y-2">
                    {MODULES.map((m) => (
                      <li key={m} className="flex items-center gap-2 text-sm">
                        <span className="size-1.5 rounded-full bg-warning" />
                        {m}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button disabled={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Submit
                registration
              </Button>
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold">Your entities</h2>
          {businesses.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No businesses registered yet. Complete the form to be routed.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {businesses.map((b) => (
                <li key={b.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{b.name}</p>
                    {b.verification === "verified" ? (
                      <BadgeCheck className="size-4 shrink-0 text-accent" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.city ? `${b.city}, ` : ""}
                    {b.province}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant={b.route === "grant_ready" ? "default" : "secondary"}>
                      {b.route === "grant_ready" ? "Grant ready" : "Upskilling"}
                    </Badge>
                    <Badge variant="outline">{b.verification}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
