import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { myBusinessesQuery, myProfileQuery, myRolesQuery } from "@/lib/api";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Profile — VukaBiz" },
      {
        name: "description",
        content: "Manage your VukaBiz profile, contact details, roles and registered businesses.",
      },
      { property: "og:title", content: "Settings & Profile — VukaBiz" },
      {
        property: "og:description",
        content: "Manage your profile details, roles and registered SME entities.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(myProfileQuery);
  const { data: roles = [] } = useQuery(myRolesQuery);
  const { data: businesses = [] } = useQuery(myBusinessesQuery);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be signed in.");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: fullName.trim() || null, phone: phone.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <AppShell title="Settings & Profile" description="Your account, roles and registered entities.">
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold">Profile details</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Thandi Mokoena"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27 82 000 0000"
              />
            </div>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">Roles & access</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(roles.length ? roles : ["member"]).map((role) => (
                <Badge key={role} className="bg-primary/15 text-primary capitalize">
                  <UserRound className="size-3.5" /> {role}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Trustee access unlocks the multi-signature approval panel in the fund portal.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">Registered businesses</h2>
            {businesses.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No businesses registered yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {businesses.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{b.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.sector ?? "Sector n/a"} · {b.city ?? "—"} · added {shortDate(b.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-muted text-muted-foreground capitalize">
                        {b.route.replace("_", " ")}
                      </Badge>
                      <Badge
                        className={
                          b.verification === "verified"
                            ? "bg-accent/20 text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {b.verification}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">Session</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign out of this device. You can sign back in at any time.
            </p>
            <Button variant="outline" className="mt-3" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
