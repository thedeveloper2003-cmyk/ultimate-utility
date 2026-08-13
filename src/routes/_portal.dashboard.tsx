import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays, CheckCircle2, ClipboardList, FolderKanban, Bell, Users,
  FileText, Clock, ArrowRight,
} from "lucide-react";
import { PageHeader, SectionCard, EmptyState, StatusBadge } from "@/components/portal/primitives";
import { TimelineView, TaskCard, MeetingCard, ProjectCard } from "@/components/portal/widgets";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  usePortal, currentEmployee, todaysAttendance, workProgress, fmtDuration, fmtTime, fmtDate,
} from "@/lib/portal/store";
import { dateKey } from "@/lib/portal/seed";
import type { PortalState } from "@/lib/portal/types";

export const Route = createFileRoute("/_portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nexora Employee Portal" },
      { name: "description", content: "Your working day at a glance: attendance, tasks, meetings, projects and notifications." },
      { property: "og:title", content: "Dashboard — Nexora Employee Portal" },
      { property: "og:description", content: "Your working day at a glance: attendance, tasks, meetings, projects and notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function StatTile({
  icon: Icon, label, value, hint, to,
}: { icon: typeof ClipboardList; label: string; value: string; hint: string; to: string }) {
  return (
    <Link to={to} className="surface-card flex items-start gap-3 p-4 transition-colors hover:border-primary/40">
      <span className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="tabular text-xl font-semibold text-foreground">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
      </div>
    </Link>
  );
}

const selector = (s: PortalState) => s;

function Page() {
  const s = usePortal(selector);
  const now = useNow();
  const me = currentEmployee(s);
  const key = dateKey(now);

  const attendance = todaysAttendance(s);
  const work = workProgress(attendance?.checkInTime ?? s.session?.loginTime ?? null, now);

  const myTasks = s.tasks.filter((t) => t.employeeId === me?.employeeId);
  const openTasks = myTasks.filter((t) => !["Completed", "Cancelled"].includes(t.status));
  const dueToday = openTasks.filter((t) => t.dueDate === key);
  const overdue = openTasks.filter((t) => t.dueDate < key);
  const completedThisMonth = myTasks.filter(
    (t) => t.status === "Completed" && t.updatedAt.slice(0, 7) === key.slice(0, 7),
  );

  const todaysBlocks = s.timeline.filter((b) => b.date === key && b.employeeId === me?.employeeId);
  const todaysMeetings = s.meetings
    .filter((m) => m.date === key && (m.participantIds.includes(me?.employeeId ?? "") || m.organizerId === me?.employeeId))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const myProjects = s.projects.filter((p) => p.memberIds.includes(me?.employeeId ?? "") || p.leadId === me?.employeeId);
  const unread = s.notifications.filter((n) => n.employeeId === me?.employeeId && !n.readAt);
  const pendingRequests = s.requests.filter((r) => !["Resolved", "Closed", "Rejected"].includes(r.status));
  const recentActivity = s.activity.filter((a) => a.employeeId === me?.employeeId).slice(0, 6);

  const priorityTasks = [...openTasks].sort((a, b) => {
    const rank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return (rank[a.priority]! - rank[b.priority]!) || a.dueDate.localeCompare(b.dueDate);
  }).slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Good day, ${me?.firstName ?? "there"}`}
        description={`${fmtDate(now.toISOString())} · ${me?.jobTitle ?? ""} · ${me?.team ?? ""}`}
        actions={
          <>
            <Button asChild variant="outline" size="sm"><Link to="/timeline">Daily timeline</Link></Button>
            <Button asChild size="sm"><Link to="/tasks">My tasks</Link></Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Today's attendance"
          subtitle="Check-in captured at login · 9-hour working day"
          className="lg:col-span-1"
          action={<StatusBadge value={attendance?.status ?? "Present"} />}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Checked in</p>
                <p className="tabular text-lg font-semibold">{fmtTime(attendance?.checkInTime ?? s.session?.loginTime)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected end</p>
                <p className="tabular text-lg font-semibold">{fmtTime(work.expected)}</p>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />Worked {fmtDuration(work.workedMinutes)}</span>
                <span className="tabular">{work.percent}%</span>
              </div>
              <Progress value={work.percent} className="h-2" aria-label={`Work day ${work.percent}% complete`} />
              <p className="mt-1 text-[11px] text-muted-foreground">{fmtDuration(work.remainingMinutes)} remaining · status {attendance?.workStatus ?? "Working"}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/attendance">View attendance history</Link>
            </Button>
          </div>
        </SectionCard>

        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
          <StatTile icon={ClipboardList} label="Open tasks" value={String(openTasks.length)} hint={`${dueToday.length} due today · ${overdue.length} overdue`} to="/tasks" />
          <StatTile icon={CheckCircle2} label="Completed this month" value={String(completedThisMonth.length)} hint={`${myTasks.length} tasks assigned overall`} to="/tasks" />
          <StatTile icon={CalendarDays} label="Meetings today" value={String(todaysMeetings.length)} hint={todaysMeetings[0] ? `Next ${fmtTime(todaysMeetings[0].startTime)}` : "Nothing scheduled"} to="/meetings" />
          <StatTile icon={FolderKanban} label="Active projects" value={String(myProjects.filter((p) => p.status === "Active").length)} hint={`${myProjects.length} total memberships`} to="/projects" />
          <StatTile icon={Bell} label="Unread notifications" value={String(unread.length)} hint={`${s.notifications.length} in your inbox`} to="/notifications" />
          <StatTile icon={FileText} label="Open requests" value={String(pendingRequests.length)} hint={`${s.approvals.filter((a) => a.status === "Pending").length} approvals pending`} to="/requests" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Today's timeline"
          subtitle="Login, tasks, meetings and focus blocks"
          className="lg:col-span-2"
          action={<Button asChild variant="ghost" size="sm"><Link to="/timeline">Open <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>}
        >
          <TimelineView blocks={todaysBlocks.slice(0, 6)} />
        </SectionCard>

        <SectionCard
          title="Meetings today"
          subtitle="Your calendar for the day"
          action={<Button asChild variant="ghost" size="sm"><Link to="/meetings">All</Link></Button>}
        >
          {todaysMeetings.length === 0 ? (
            <EmptyState title="No meetings" message="You have a clear calendar today. Enjoy the focus time." />
          ) : (
            <div className="space-y-2">
              {todaysMeetings.slice(0, 5).map((m) => <MeetingCard key={m.meetingId} meeting={m} />)}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Priority tasks"
          subtitle="Sorted by priority and due date"
          className="lg:col-span-2"
          action={<Button asChild variant="ghost" size="sm"><Link to="/tasks">All tasks</Link></Button>}
        >
          {priorityTasks.length === 0 ? (
            <EmptyState title="Nothing open" message="Every assigned task is completed or cancelled." />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {priorityTasks.map((t) => (
                <TaskCard key={t.taskId} task={t} project={s.projects.find((p) => p.projectId === t.projectId)} />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent activity"
          subtitle="Your latest actions across modules"
          action={<Button asChild variant="ghost" size="sm"><Link to="/activity">Log</Link></Button>}
        >
          {recentActivity.length === 0 ? (
            <EmptyState title="No activity yet" message="Actions you take in the portal are recorded here." />
          ) : (
            <ol className="space-y-2">
              {recentActivity.map((a) => (
                <li key={a.activityId} className="rounded-md border border-border bg-card p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">{a.action}</p>
                    <span className="tabular text-[11px] text-muted-foreground">{fmtTime(a.timestamp)}</span>
                  </div>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{a.detail}</p>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="My projects"
          subtitle="Programmes you contribute to"
          className="lg:col-span-2"
          action={<Button asChild variant="ghost" size="sm"><Link to="/projects">All projects</Link></Button>}
        >
          {myProjects.length === 0 ? (
            <EmptyState title="No projects" message="You are not assigned to a project yet." />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {myProjects.slice(0, 4).map((p) => (
                <ProjectCard key={p.projectId} project={p} lead={s.employees.find((e) => e.employeeId === p.leadId)} />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Announcements"
          subtitle="Latest from the organisation"
          action={<Button asChild variant="ghost" size="sm"><Link to="/announcements">All</Link></Button>}
        >
          <div className="space-y-2">
            {s.announcements.slice(0, 4).map((a) => (
              <Link key={a.announcementId} to="/announcements" className="block rounded-md border border-border bg-card p-2.5 transition-colors hover:border-primary/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium">{a.title}</p>
                  <StatusBadge value={a.priority} />
                </div>
                <p className="line-clamp-2 text-[11px] text-muted-foreground">{a.description}</p>
              </Link>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/team"><Users className="mr-1.5 h-3.5 w-3.5" />Open my team</Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
