import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Users } from "lucide-react";
import { PageHeader, SectionCard, EmployeeAvatar, StatusBadge, EmptyState } from "@/components/portal/primitives";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/organization")({
  head: () => ({
    meta: [
      { title: "Employee Directory — Nexora Employee Portal" },
      { name: "description", content: "Search the full employee directory by name, department, team or location and see the reporting structure." },
      { property: "og:title", content: "Employee Directory — Nexora Employee Portal" },
      { property: "og:description", content: "Search colleagues across departments, teams and locations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");

  const departments = useMemo(() => ["all", ...new Set(state.employees.map((e) => e.department))], [state.employees]);

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.employees
      .filter((e) => (dept === "all" ? true : e.department === dept))
      .filter((e) => (!q ? true : (e.displayName + e.email + e.jobTitle + e.team + e.location).toLowerCase().includes(q)))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [state.employees, dept, query]);

  const byDepartment = useMemo(() => {
    const map = new Map<string, number>();
    state.employees.forEach((e) => map.set(e.department, (map.get(e.department) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [state.employees]);

  return (
    <>
      <PageHeader title="Employee Directory" description="Find colleagues, see where they sit in the organisation and how to reach them." />

      <div className="grid gap-4 lg:grid-cols-4">
        <SectionCard title="Departments" subtitle="Headcount by department">
          <ul className="space-y-2">
            {byDepartment.map(([name, count]) => (
              <li key={name} className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5">
                <span className="flex items-center gap-2 text-xs font-medium"><Building2 className="h-3.5 w-3.5 text-primary" />{name}</span>
                <span className="tabular flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{count}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="People"
          subtitle={`${people.length} employees`}
          className="lg:col-span-3"
          action={
            <div className="flex items-center gap-2">
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="h-9 w-48" placeholder="Search people…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          }
        >
          {people.length === 0 ? (
            <EmptyState title="No matches" message="Try a different name, team or location." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Reports to</TableHead>
                    <TableHead>Presence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {people.map((e) => {
                    const mgr = state.employees.find((m) => m.employeeId === e.managerId);
                    return (
                      <TableRow key={e.employeeId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <EmployeeAvatar name={e.displayName} size="sm" availability={e.availability} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{e.displayName}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{e.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{e.jobTitle}</TableCell>
                        <TableCell className="text-xs">{e.team}</TableCell>
                        <TableCell className="text-xs">{e.location}</TableCell>
                        <TableCell className="text-xs">{mgr?.displayName ?? "—"}</TableCell>
                        <TableCell><StatusBadge value={e.availability} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
