import { addDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { EmptyState, ListRow, StatusBadge, EmployeeAvatar } from "./primitives";
import { dateKey, fmtDate, fmtTime } from "@/lib/portal/store";
import type { Employee, Meeting, Project, Task, TimelineBlock, EmployeeRequest, DocumentItem, AppNotification, Announcement } from "@/lib/portal/types";

export function DateNavigator({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const today = startOfDay(new Date());
  const isToday = isSameDay(value, today);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-md border border-border bg-card">
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Previous day" onClick={() => onChange(addDays(value, -1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="tabular min-w-40 px-2 text-center text-[13px] font-medium">
          {format(value, "EEE, dd MMM yyyy")}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Next day" onClick={() => onChange(addDays(value, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5"><CalendarDays className="h-4 w-4" />Pick date</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar mode="single" selected={value} onSelect={(d) => d && onChange(startOfDay(d))} autoFocus />
        </PopoverContent>
      </Popover>
      <Button variant={isToday ? "secondary" : "outline"} size="sm" className="h-8" onClick={() => onChange(today)}>Today</Button>
      <StatusBadge value={isToday ? "Current day" : value > today ? "Planned work" : "Historical"} tone={isToday ? "primary" : value > today ? "info" : "neutral"} />
    </div>
  );
}

const BLOCK_TONE: Record<string, string> = {
  LOGIN: "border-l-info", TASK: "border-l-primary", MEETING: "border-l-warning",
  BREAK: "border-l-muted-foreground", FOCUS: "border-l-success", TRAINING: "border-l-info",
  EVENT: "border-l-accent", PROJECT: "border-l-primary", OTHER: "border-l-border",
};

export function TimelineView({ blocks }: { blocks: TimelineBlock[] }) {
  if (blocks.length === 0) {
    return <EmptyState title="Nothing scheduled" message="There are no timeline blocks recorded for this day. Sign-in, tasks, meetings and focus blocks appear here automatically." />;
  }
  const sorted = [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));
  return (
    <ol className="space-y-2">
      {sorted.map((b) => (
        <li key={b.id} className={`rounded-md border border-border border-l-4 bg-card p-3 ${BLOCK_TONE[b.type] ?? "border-l-border"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="tabular text-xs font-semibold text-muted-foreground">
                {fmtTime(b.startTime)}{b.endTime !== b.startTime ? ` – ${fmtTime(b.endTime)}` : ""}
              </span>
              <StatusBadge value={b.type} tone="neutral" />
            </div>
            <StatusBadge value={b.status} />
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">{b.title}</p>
          <p className="text-xs text-muted-foreground">{b.description}</p>
          <div className="mt-2 flex gap-3 text-xs">
            {b.taskId ? <Link to="/tasks/$taskId" params={{ taskId: b.taskId }} className="text-primary hover:underline">Open task</Link> : null}
            {b.meetingId ? <Link to="/meetings/$meetingId" params={{ meetingId: b.meetingId }} className="text-primary hover:underline">Open meeting</Link> : null}
            {b.projectId ? <Link to="/projects/$projectId" params={{ projectId: b.projectId }} className="text-primary hover:underline">Open project</Link> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function TaskCard({ task, project }: { task: Task; project?: Project | undefined }) {
  return (
    <Link
      to="/tasks/$taskId"
      params={{ taskId: task.taskId }}
      className="block rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{task.title}</p>
        <StatusBadge value={task.status} />
      </div>
      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <StatusBadge value={task.priority} />
        <span>{project?.code ?? task.projectId}</span>
        <span>· Due {fmtDate(task.dueDate + "T00:00:00.000Z")}</span>
      </div>
      <Progress value={task.progress} className="mt-2 h-1.5" aria-label={`Progress ${task.progress}%`} />
    </Link>
  );
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <ListRow>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to="/meetings/$meetingId" params={{ meetingId: meeting.meetingId }} className="text-sm font-medium hover:underline">
            {meeting.title}
          </Link>
          <p className="tabular text-xs text-muted-foreground">
            {fmtTime(meeting.startTime)} – {fmtTime(meeting.endTime)} · {meeting.location}
          </p>
        </div>
        <StatusBadge value={meeting.status} />
      </div>
    </ListRow>
  );
}

export function ProjectCard({ project, lead }: { project: Project; lead?: Employee | undefined }) {
  return (
    <Link to="/projects/$projectId" params={{ projectId: project.projectId }} className="block rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{project.name}</p>
          <p className="text-xs text-muted-foreground">{project.code} · Lead {lead?.displayName ?? project.leadId}</p>
        </div>
        <StatusBadge value={project.status} />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
      <div className="mt-3 flex items-center gap-2">
        <Progress value={project.progress} className="h-1.5" />
        <span className="tabular text-xs font-medium text-muted-foreground">{project.progress}%</span>
      </div>
    </Link>
  );
}

export function NotificationItem({ n, onOpen }: { n: AppNotification; onOpen: (n: AppNotification) => void }) {
  return (
    <button onClick={() => onOpen(n)} className={`block w-full rounded-md border border-border p-3 text-left transition-colors hover:border-primary/40 ${n.readAt ? "bg-card" : "bg-primary/5"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{n.title}</p>
        <div className="flex items-center gap-2">
          <StatusBadge value={n.priority} />
          {!n.readAt ? <StatusBadge value="Unread" tone="info" /> : null}
        </div>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{fmtDate(n.createdAt)} · {fmtTime(n.createdAt)}</p>
    </button>
  );
}

export function AnnouncementCard({ a, read, onOpen }: { a: Announcement; read: boolean; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className={`block w-full rounded-md border border-border p-3 text-left transition-colors hover:border-primary/40 ${read ? "bg-card" : "bg-primary/5"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{a.title}</p>
        <div className="flex gap-2">
          <StatusBadge value={a.priority} />
          <StatusBadge value={read ? "Read" : "Unread"} tone={read ? "neutral" : "info"} />
        </div>
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{a.category} · published {fmtDate(a.publishedAt)}</p>
    </button>
  );
}

export function DocumentCard({ doc }: { doc: DocumentItem }) {
  return (
    <Link to="/documents/$documentId" params={{ documentId: doc.documentId }} className="block rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{doc.name}</p>
        <StatusBadge value={doc.fileType.toUpperCase()} tone="neutral" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{doc.category} · {doc.version} · {doc.sizeKb} KB</p>
      <p className="text-[11px] text-muted-foreground">Updated {fmtDate(doc.updatedAt)}</p>
    </Link>
  );
}

export function RequestCard({ r }: { r: EmployeeRequest }) {
  return (
    <Link to="/requests/$requestId" params={{ requestId: r.requestId }} className="block rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">{r.title}</p>
        <StatusBadge value={r.status} />
      </div>
      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.description}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{r.requestId} · {r.category} · raised {fmtDate(r.createdAt)}</p>
    </Link>
  );
}

export function UserCard({ e, actions }: { e: Employee; actions?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <EmployeeAvatar name={e.displayName} availability={e.availability} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{e.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{e.jobTitle}</p>
          <p className="truncate text-[11px] text-muted-foreground">{e.department} · {e.team} · {e.location}</p>
          <p className="truncate text-[11px] text-muted-foreground">{e.email}</p>
        </div>
        <StatusBadge value={e.availability} />
      </div>
      {actions ? <div className="mt-3 flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export const keyOf = (d: Date) => dateKey(d);
export const parseKey = (k: string) => parseISO(`${k}T00:00:00`);
