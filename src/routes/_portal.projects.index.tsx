import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard, EmptyState, EmployeeAvatar, StatusBadge } from "@/components/portal/primitives";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentEmployee, fmtDate, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Nexora Employee Portal" },
      { name: "description", content: "Projects you contribute to with progress, milestones, team members and linked tasks." },
      { property: "og:title", content: "Projects — Nexora Employee Portal" },
      { property: "og:description", content: "Project progress, milestones and teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [tab, setTab] = useState("mine");
  const [query, setQuery] = useState("");

  const projects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.projects
      .filter((p) => (tab === "mine" ? p.memberIds.includes(me?.employeeId ?? "") || p.leadId === me?.employeeId : tab === "active" ? p.status === "Active" : true))
      .filter((p) => (!q ? true : (p.name + p.code + p.description).toLowerCase().includes(q)));
  }, [state.projects, tab, me?.employeeId, query]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Programme delivery status, milestones and the people involved."
        actions={<Input className="h-9 w-56" placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} />}
      />

      <div className="mb-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="mine">My projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {projects.length === 0 ? (
        <SectionCard title="Projects" subtitle="No matches">
          <EmptyState title="No projects" message="Nothing matches this filter." />
        </SectionCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const lead = state.employees.find((e) => e.employeeId === p.leadId);
            const tasks = state.tasks.filter((t) => t.projectId === p.projectId);
            const done = tasks.filter((t) => t.status === "Completed").length;
            const nextMilestone = [...p.milestones].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).find((m) => m.status !== "Completed");
            return (
              <article key={p.projectId} className="surface-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to="/projects/$projectId" params={{ projectId: p.projectId }} className="text-sm font-semibold hover:underline">{p.name}</Link>
                    <p className="tabular text-[11px] text-muted-foreground">{p.code} · {fmtDate(p.startDate)} → {fmtDate(p.endDate)}</p>
                  </div>
                  <StatusBadge value={p.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Progress</span><span className="tabular">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-2" aria-label={`${p.name} ${p.progress}% complete`} />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-md border border-border p-2">
                    <dt className="text-muted-foreground">Tasks done</dt>
                    <dd className="tabular font-semibold">{done}/{tasks.length}</dd>
                  </div>
                  <div className="rounded-md border border-border p-2">
                    <dt className="text-muted-foreground">Next milestone</dt>
                    <dd className="truncate font-semibold">{nextMilestone ? nextMilestone.title : "All complete"}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex -space-x-2">
                    {p.memberIds.slice(0, 5).map((id) => {
                      const m = state.employees.find((e) => e.employeeId === id);
                      return m ? <EmployeeAvatar key={id} name={m.displayName} size="sm" /> : null;
                    })}
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">Lead: {lead?.displayName ?? p.leadId}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
