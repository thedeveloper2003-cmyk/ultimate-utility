import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Inbox } from "lucide-react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="page-title">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function SectionCard({
  title, subtitle, action, children, className,
}: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("surface-card flex flex-col p-4", className)} aria-label={title}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export function EmployeeAvatar({ name, size = "md", availability }: { name: string; size?: "sm" | "md" | "lg"; availability?: string }) {
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-14 w-14 text-base" : "h-10 w-10 text-xs";
  const dot: Record<string, string> = {
    Available: "bg-success", Busy: "bg-destructive", "In Meeting": "bg-warning",
    "Do Not Disturb": "bg-destructive", Away: "bg-warning", Offline: "bg-muted-foreground",
  };
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar className={dim}>
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials(name)}</AvatarFallback>
      </Avatar>
      {availability ? (
        <span
          aria-label={`Availability: ${availability}`}
          className={cn("absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card", dot[availability] ?? "bg-muted-foreground")}
        />
      ) : null}
    </span>
  );
}

const TONE: Record<string, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-info/30 bg-info/10 text-info",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/15 text-warning-foreground",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
  primary: "border-primary/25 bg-primary/10 text-primary",
};

export function toneFor(value: string): keyof typeof TONE {
  switch (value) {
    case "Completed": case "Approved": case "Resolved": case "Closed": case "Active": case "Available": case "Present": case "Work Completed":
      return "success";
    case "In Progress": case "Under Review": case "Assigned": case "Submitted": case "Received": case "Working": case "Scheduled": case "Remote":
      return "info";
    case "Blocked": case "Cancelled": case "Rejected": case "Critical": case "Do Not Disturb": case "Locked": case "Suspended": case "Absent":
      return "danger";
    case "On Hold": case "Waiting for Employee": case "High": case "Away": case "In Meeting": case "Pending": case "Changes Requested": case "On Break":
      return "warning";
    case "Focus Time": case "Planned": case "Medium":
      return "primary";
    default:
      return "neutral";
  }
}

export function StatusBadge({ value, tone }: { value: string; tone?: keyof typeof TONE }) {
  return (
    <Badge variant="outline" className={cn("rounded-full px-2 py-0 text-[11px] font-medium", TONE[tone ?? toneFor(value)])}>
      {value}
    </Badge>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border px-6 py-10 text-center">
      <Inbox className="mb-3 h-6 w-6 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center rounded-md border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
      <AlertTriangle className="mb-2 h-5 w-5 text-destructive" aria-hidden />
      <p className="text-sm font-medium text-destructive">{message}</p>
      {onRetry ? <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>Retry</Button> : null}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}

export function ListRow({ to, children }: { to?: string; children: ReactNode }) {
  const cls = "block rounded-md border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <div className={cls}>{children}</div>;
}
