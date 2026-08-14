import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader, SectionCard, EmployeeAvatar, StatusBadge } from "@/components/portal/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { currentEmployee, fmtDate, permissionsOf, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Protechsoft Employee Portal" },
      { name: "description", content: "Your employee record: role, reporting line, work schedule, skills and portal permissions." },
      { property: "og:title", content: "My Profile — Protechsoft Employee Portal" },
      { property: "og:description", content: "Your employee record, reporting line, schedule and permissions." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const manager = state.employees.find((e) => e.employeeId === me?.managerId);
  const permissions = permissionsOf(state);
  if (!me) return null;

  const myTasks = state.tasks.filter((t) => t.employeeId === me.employeeId);
  const myProjects = state.projects.filter((p) => p.memberIds.includes(me.employeeId) || p.leadId === me.employeeId);
  const recognition = state.recognition.filter((r) => r.toId === me.employeeId);

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your employee record as held by HR and the workspace directory."
        actions={<Button asChild variant="outline" size="sm"><Link to="/settings">Preferences</Link></Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Identity" subtitle="Directory card">
          <div className="flex items-center gap-3">
            <EmployeeAvatar name={me.displayName} size="lg" availability={me.availability} />
            <div className="min-w-0">
              <p className="text-base font-semibold">{me.displayName}</p>
              <p className="text-xs text-muted-foreground">{me.jobTitle}</p>
              <p className="text-xs text-muted-foreground">{me.employeeCode} · {me.department}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-3">
            <Field label="Email" value={me.email} />
            <Field label="Phone" value={me.phone} />
            <Field label="Location" value={me.location} />
            <Field label="Timezone" value={me.timezone} />
          </div>
        </SectionCard>

        <SectionCard title="Employment" subtitle="Role and reporting" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Team" value={me.team} />
            <Field label="Work schedule" value={me.workSchedule} />
            <Field label="Employment type" value={me.employmentStatus} />
            <Field label="Joined on" value={fmtDate(me.joinedOn + "T00:00:00.000Z")} />
            <Field label="Reporting manager" value={manager?.displayName ?? "—"} />
            <Field label="Portal role" value={me.role} />
          </div>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={me.accountStatus} />
            <StatusBadge value={me.availability} />
            <span className="text-xs text-muted-foreground">Account state and presence are managed by IT and your own status.</span>
          </div>
          <Separator className="my-4" />
          <p className="section-title mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {me.skills.map((s) => <Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>)}
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Workload snapshot" subtitle="Assignments across the portal">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ["Tasks", myTasks.length],
              ["Projects", myProjects.length],
              ["Kudos", recognition.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg border border-border p-3">
                <p className="tabular text-xl font-semibold">{value as number}</p>
                <p className="text-[11px] text-muted-foreground">{label as string}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Portal permissions" subtitle={`Granted by the ${me.role} role`} className="lg:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            {permissions.map((p) => (
              <Badge key={p} variant="outline" className="rounded-full text-[11px] font-medium">{p.replaceAll("_", " ").toLowerCase()}</Badge>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
