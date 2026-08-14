import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, Phone, Award } from "lucide-react";
import { PageHeader, SectionCard, EmployeeAvatar, StatusBadge, EmptyState } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { currentEmployee, fmtTime, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/team")({
  head: () => ({
    meta: [
      { title: "My Team — Protechsoft Employee Portal" },
      { name: "description", content: "Your immediate team: presence, skills, workload and today's meetings for every colleague." },
      { property: "og:title", content: "My Team — Protechsoft Employee Portal" },
      { property: "og:description", content: "Team presence, skills and current workload." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [query, setQuery] = useState("");

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.employees
      .filter((e) => e.team === me?.team || e.employeeId === me?.managerId)
      .filter((e) => (!q ? true : (e.displayName + e.jobTitle + e.skills.join(" ")).toLowerCase().includes(q)));
  }, [state.employees, me?.team, me?.managerId, query]);

  const openTasksFor = (id: string) =>
    state.tasks.filter((t) => t.employeeId === id && !["Completed", "Cancelled"].includes(t.status)).length;

  return (
    <>
      <PageHeader
        title="My Team"
        description={`${me?.team ?? "Team"} · ${members.length} colleagues including your reporting line.`}
        actions={<Input className="h-9 w-56" placeholder="Search team…" value={query} onChange={(e) => setQuery(e.target.value)} />}
      />

      {members.length === 0 ? (
        <SectionCard title="Team" subtitle="No matches">
          <EmptyState title="Nobody found" message="Adjust your search to see colleagues again." />
        </SectionCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {members.map((e) => {
            const kudos = state.recognition.filter((r) => r.toId === e.employeeId).length;
            const nextMeeting = state.meetings
              .filter((m) => m.participantIds.includes(e.employeeId))
              .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];
            return (
              <article key={e.employeeId} className="surface-card p-4">
                <div className="flex items-start gap-3">
                  <EmployeeAvatar name={e.displayName} size="lg" availability={e.availability} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{e.displayName}{e.employeeId === me?.employeeId ? " (you)" : ""}</p>
                        <p className="truncate text-xs text-muted-foreground">{e.jobTitle}</p>
                      </div>
                      <StatusBadge value={e.availability} />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{e.location} · {e.timezone}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.skills.slice(0, 4).map((s) => <Badge key={s} variant="secondary" className="rounded-full text-[10px]">{s}</Badge>)}
                </div>

                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border border-border p-2">
                    <dt className="text-[10px] text-muted-foreground">Open tasks</dt>
                    <dd className="tabular text-sm font-semibold">{openTasksFor(e.employeeId)}</dd>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <dt className="text-[10px] text-muted-foreground">Kudos</dt>
                    <dd className="tabular flex items-center justify-center gap-1 text-sm font-semibold"><Award className="h-3 w-3 text-warning" />{kudos}</dd>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <dt className="text-[10px] text-muted-foreground">Next meeting</dt>
                    <dd className="tabular text-sm font-semibold">{nextMeeting ? fmtTime(nextMeeting.startTime) : "—"}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={`mailto:${e.email}`}><Mail className="mr-1.5 h-3.5 w-3.5" />Email</a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={`tel:${e.phone.replace(/\s/g, "")}`}><Phone className="mr-1.5 h-3.5 w-3.5" />Call</a>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
