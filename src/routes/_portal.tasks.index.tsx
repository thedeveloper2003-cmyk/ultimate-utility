import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, PageHeader, SectionCard, StatusBadge } from "@/components/portal/primitives";
import { createTask, fmtDate, hasPermission, setTaskStatus, usePortal } from "@/lib/portal/store";
import type { Priority, Task, TaskStatus } from "@/lib/portal/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_portal/tasks/")({
  head: () => ({
    meta: [
      { title: "My Tasks — Nexora Employee Portal" },
      { name: "description", content: "Track, filter and update every task assigned to you across active projects." },
      { property: "og:title", content: "My Tasks — Nexora Employee Portal" },
      { property: "og:description", content: "Track, filter and update every task assigned to you across active projects." },
    ],
  }),
  component: TasksPage,
});

const STATUSES: TaskStatus[] = ["Not Started", "Assigned", "In Progress", "Blocked", "On Hold", "Under Review", "Completed", "Cancelled"];
const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
const PRIORITY_RANK: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const OPEN_STATUSES: TaskStatus[] = ["Not Started", "Assigned", "In Progress", "Blocked", "On Hold", "Under Review"];

function dueMeta(task: Task) {
  const days = differenceInCalendarDays(parseISO(`${task.dueDate}T00:00:00`), new Date());
  if (task.status === "Completed" || task.status === "Cancelled") return null;
  if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, tone: "danger" as const };
  if (days === 0) return { label: "Due today", tone: "warning" as const };
  if (days <= 3) return { label: `Due in ${days}d`, tone: "warning" as const };
  return null;
}

function TasksPage() {
  const tasks = usePortal((s) => s.tasks);
  const projects = usePortal((s) => s.projects);
  const employees = usePortal((s) => s.employees);
  const me = usePortal((s) => s.session?.employeeId ?? "");
  const canCreate = usePortal((s) => hasPermission(s, "TASK_CREATE"));

  const [tab, setTab] = useState<"open" | "today" | "overdue" | "completed" | "all">("open");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [project, setProject] = useState<string>("all");
  const [sort, setSort] = useState<"due" | "priority" | "updated">("due");

  const mine = useMemo(() => tasks.filter((t) => t.employeeId === me || !me), [tasks, me]);

  const counts = useMemo(() => {
    const today = new Date();
    return {
      open: mine.filter((t) => OPEN_STATUSES.includes(t.status)).length,
      today: mine.filter((t) => OPEN_STATUSES.includes(t.status) && differenceInCalendarDays(parseISO(`${t.dueDate}T00:00:00`), today) === 0).length,
      overdue: mine.filter((t) => OPEN_STATUSES.includes(t.status) && differenceInCalendarDays(parseISO(`${t.dueDate}T00:00:00`), today) < 0).length,
      completed: mine.filter((t) => t.status === "Completed").length,
      all: mine.length,
    };
  }, [mine]);

  const visible = useMemo(() => {
    const today = new Date();
    const q = query.trim().toLowerCase();
    let list = mine.filter((t) => {
      const days = differenceInCalendarDays(parseISO(`${t.dueDate}T00:00:00`), today);
      if (tab === "open" && !OPEN_STATUSES.includes(t.status)) return false;
      if (tab === "today" && !(OPEN_STATUSES.includes(t.status) && days === 0)) return false;
      if (tab === "overdue" && !(OPEN_STATUSES.includes(t.status) && days < 0)) return false;
      if (tab === "completed" && t.status !== "Completed") return false;
      if (status !== "all" && t.status !== status) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (project !== "all" && t.projectId !== project) return false;
      if (q && !`${t.title} ${t.description} ${t.taskId} ${t.tags.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.dueDate.localeCompare(b.dueDate);
      if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
      return a.dueDate.localeCompare(b.dueDate) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    });
    return list;
  }, [mine, tab, query, status, priority, project, sort]);

  const projectOf = (id: string) => projects.find((p) => p.projectId === id);
  const nameOf = (id: string) => employees.find((e) => e.employeeId === id)?.displayName ?? id;

  return (
    <>
      <PageHeader
        title="My Tasks"
        description="Every task assigned to you, linked to its project, timeline block and activity trail."
        actions={canCreate ? <NewTaskDialog /> : null}
      />

      <div className="space-y-4">
        <SectionCard title="Filters" subtitle="Narrow the list by status, priority, project or keyword.">
          <div className="space-y-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="flex-wrap">
                <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
                <TabsTrigger value="today">Due today ({counts.today})</TabsTrigger>
                <TabsTrigger value="overdue">Overdue ({counts.overdue})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks, tags or IDs"
                  aria-label="Search tasks"
                  className="pl-8"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger aria-label="Filter by status"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger aria-label="Filter by priority"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger aria-label="Filter by project"><SelectValue placeholder="Project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects.map((p) => <SelectItem key={p.projectId} value={p.projectId}>{p.code} — {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={`${visible.length} task${visible.length === 1 ? "" : "s"}`}
          subtitle="Update status inline — timeline, activity and notifications stay in sync."
          action={
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-8 w-40" aria-label="Sort tasks"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="due">Sort: Due date</SelectItem>
                <SelectItem value="priority">Sort: Priority</SelectItem>
                <SelectItem value="updated">Sort: Last updated</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          {visible.length === 0 ? (
            <EmptyState title="No tasks match" message="Adjust the filters or clear the search to see more of your workload." />
          ) : (
            <ul className="space-y-2">
              {visible.map((t) => {
                const due = dueMeta(t);
                return (
                  <li key={t.taskId} className="rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/40">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to="/tasks/$taskId" params={{ taskId: t.taskId }} className="text-sm font-semibold hover:underline">
                            {t.title}
                          </Link>
                          <StatusBadge value={t.priority} />
                          {due ? <StatusBadge value={due.label} tone={due.tone} /> : null}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{t.description}</p>
                        <p className="tabular mt-1 text-[11px] text-muted-foreground">
                          {t.taskId} · {projectOf(t.projectId)?.code ?? t.projectId} · Due {fmtDate(`${t.dueDate}T00:00:00.000Z`)} · Assigned by {nameOf(t.assignedBy)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={t.progress} className="h-1.5 max-w-64" aria-label={`Progress ${t.progress}%`} />
                          <span className="tabular text-[11px] text-muted-foreground">{t.progress}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge value={t.status} />
                        <Select
                          value={t.status}
                          onValueChange={(v) => {
                            setTaskStatus(t.taskId, v as TaskStatus);
                            toast.success(`${t.title} → ${v}`);
                          }}
                        >
                          <SelectTrigger className="h-8 w-40" aria-label={`Update status for ${t.title}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}

function NewTaskDialog() {
  const projects = usePortal((s) => s.projects);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.projectId ?? "");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [hours, setHours] = useState("4");

  const submit = () => {
    if (!title.trim() || !projectId || !dueDate) {
      toast.error("Title, project and due date are required.");
      return;
    }
    createTask({ title: title.trim(), description: description.trim(), projectId, dueDate, priority, estimatedHours: Number(hours) || 1 });
    toast.success("Task created and added to your timeline.");
    setOpen(false);
    setTitle(""); setDescription(""); setDueDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New task</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Self-assigned tasks appear on your timeline and activity trail immediately.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Prepare quarterly release notes" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea id="task-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger aria-label="Project"><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.projectId} value={p.projectId}>{p.code} — {p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger aria-label="Priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-hours">Estimated hours</Label>
              <Input id="task-hours" type="number" min={1} value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
