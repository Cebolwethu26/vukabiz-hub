import { cn } from "@/lib/utils";

export function Brand({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="grid size-9 place-items-center rounded-lg bg-accent font-display text-lg font-bold text-accent-foreground">
        V
      </div>
      <div className="leading-tight">
        <div
          className={cn(
            "font-display text-base font-bold tracking-tight",
            inverted ? "text-sidebar-foreground" : "text-foreground",
          )}
        >
          VukaBiz
        </div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Enterprise Hub
        </div>
      </div>
    </div>
  );
}
