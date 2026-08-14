import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard, EmptyState, StatusBadge } from "@/components/portal/primitives";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currentEmployee, fmtDateTime, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/activity")({
  head: () => ({
    meta: [
      { title: "Activity & Audit — Protechsoft Employee Portal" },
      { name: "description", content: "Every action you take in the portal, plus the immutable audit trail of value changes and sessions." },
      { property: "og:title", content: "Activity & Audit — Protechsoft Employee Portal" },
      { property: "og:description", content: "Your portal activity feed and audit trail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [tab, setTab] = useState("activity");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const activity = useMemo(
    () => state.activity.filter((a) => a.employeeId === me?.employeeId && (!q || (a.action + a.detail + a.entityType).toLowerCase().includes(q))),
    [state.activity, me?.employeeId, q],
  );
  const audit = useMemo(
    () => state.audit.filter((a) => a.employeeId === me?.employeeId && (!q || (a.action + a.entityType + a.entityId).toLowerCase().includes(q))),
    [state.audit, me?.employeeId, q],
  );

  return (
    <>
      <PageHeader title="Activity" description="A chronological record of what you did in the portal and what changed as a result." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="activity">Activity feed ({activity.length})</TabsTrigger>
            <TabsTrigger value="audit">Audit trail ({audit.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input className="h-9 max-w-xs" placeholder="Filter records…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {tab === "activity" ? (
        <SectionCard title="Activity feed" subtitle="Newest first">
          {activity.length === 0 ? (
            <EmptyState title="No activity" message="Actions you take across modules are recorded here." />
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-4">
              {activity.slice(0, 80).map((a) => (
                <li key={a.activityId} className="relative">
                  <span className="absolute -left-[21px] top-2 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                  <div className="surface-card p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{a.action}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge value={a.entityType} tone="neutral" />
                        <span className="tabular text-[11px] text-muted-foreground">{fmtDateTime(a.timestamp)}</span>
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      ) : (
        <SectionCard title="Audit trail" subtitle="Immutable value changes tied to your session">
          {audit.length === 0 ? (
            <EmptyState title="No audit entries" message="Changes to records you own will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audit.slice(0, 100).map((a) => (
                    <TableRow key={a.auditId}>
                      <TableCell className="tabular whitespace-nowrap">{fmtDateTime(a.timestamp)}</TableCell>
                      <TableCell className="font-medium">{a.action}</TableCell>
                      <TableCell>{a.entityType} · {a.entityId}</TableCell>
                      <TableCell className="text-muted-foreground">{a.oldValue}</TableCell>
                      <TableCell>{a.newValue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      )}
    </>
  );
}
