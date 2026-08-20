import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "default" | "accent";
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            tone === "accent" ? "bg-accent/12 text-accent" : "bg-secondary text-secondary-foreground",
          )}
        >
          <Icon className="size-4.5" />
        </div>
      </div>
      <div className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {value}
      </div>
      {delta ? <div className="mt-1 text-xs font-medium text-accent">{delta}</div> : null}
    </div>
  );
}
