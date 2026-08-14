import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth,
  startOfMonth, startOfWeek, subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, SectionCard, EmptyState, StatusBadge } from "@/components/portal/primitives";
import { MeetingCard, TimelineView } from "@/components/portal/widgets";
import { Button } from "@/components/ui/button";
import { currentEmployee, dateKey, fmtDate, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Protechsoft Employee Portal" },
      { name: "description", content: "Monthly calendar of your meetings, task deadlines and reminders with a day agenda panel." },
      { property: "og:title", content: "Calendar — Protechsoft Employee Portal" },
      { property: "og:description", content: "Meetings, deadlines and reminders in one monthly view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => new Date());

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) }),
    [month],
  );

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, number>();
    state.meetings
      .filter((m) => m.participantIds.includes(me?.employeeId ?? "") || m.organizerId === me?.employeeId)
      .forEach((m) => map.set(m.date, (map.get(m.date) ?? 0) + 1));
    return map;
  }, [state.meetings, me?.employeeId]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, number>();
    state.tasks.filter((t) => t.employeeId === me?.employeeId).forEach((t) => map.set(t.dueDate, (map.get(t.dueDate) ?? 0) + 1));
    return map;
  }, [state.tasks, me?.employeeId]);

  const key = dateKey(selected);
  const dayMeetings = state.meetings.filter((m) => m.date === key && (m.participantIds.includes(me?.employeeId ?? "") || m.organizerId === me?.employeeId));
  const dayTasks = state.tasks.filter((t) => t.employeeId === me?.employeeId && t.dueDate === key);
  const dayReminders = state.reminders.filter((r) => r.employeeId === me?.employeeId && r.date === key);
  const dayBlocks = state.timeline.filter((b) => b.date === key && b.employeeId === me?.employeeId);

  return (
    <>
      <PageHeader title="Calendar" description="Everything scheduled for you: meetings, task deadlines and reminders." />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title={format(month, "MMMM yyyy")}
          subtitle="Click a day to open its agenda"
          action={
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Previous month" onClick={() => setMonth(subMonths(month, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => { setMonth(startOfMonth(new Date())); setSelected(new Date()); }}>Today</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d} className="pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{d}</span>
            ))}
            {days.map((d) => {
              const k = dateKey(d);
              const m = meetingsByDay.get(k) ?? 0;
              const t = tasksByDay.get(k) ?? 0;
              const isSel = isSameDay(d, selected);
              return (
                <button
                  key={k}
                  onClick={() => setSelected(d)}
                  aria-current={isSel ? "date" : undefined}
                  className={`flex h-16 flex-col items-center justify-start rounded-md border p-1 text-xs transition-colors ${
                    isSel ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                  } ${isSameMonth(d, month) ? "" : "opacity-45"}`}
                >
                  <span className={`tabular text-[11px] font-semibold ${isSameDay(d, new Date()) ? "text-primary" : ""}`}>{format(d, "d")}</span>
                  <span className="mt-1 flex flex-wrap justify-center gap-0.5">
                    {m > 0 ? <span className="rounded-full bg-info/20 px-1 text-[9px] font-semibold text-info">{m}m</span> : null}
                    {t > 0 ? <span className="rounded-full bg-primary/20 px-1 text-[9px] font-semibold text-primary">{t}t</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title={fmtDate(key + "T00:00:00.000Z")} subtitle={`${dayMeetings.length} meetings · ${dayTasks.length} deadlines · ${dayReminders.length} reminders`}>
            {dayMeetings.length === 0 && dayTasks.length === 0 && dayReminders.length === 0 ? (
              <EmptyState title="Nothing scheduled" message="This day is clear." />
            ) : (
              <div className="space-y-3">
                {dayMeetings.map((m) => <MeetingCard key={m.meetingId} meeting={m} />)}
                {dayTasks.map((t) => (
                  <Link key={t.taskId} to="/tasks/$taskId" params={{ taskId: t.taskId }} className="block rounded-md border border-border bg-card p-2.5 hover:border-primary/40">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <StatusBadge value={t.priority} />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Task deadline · {t.status}</p>
                  </Link>
                ))}
                {dayReminders.map((r) => (
                  <div key={r.reminderId} className="rounded-md border border-border bg-card p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <StatusBadge value={r.status} />
                    </div>
                    <p className="tabular text-[11px] text-muted-foreground">Reminder at {r.time}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Day timeline" subtitle="Recorded and planned blocks">
            <TimelineView blocks={dayBlocks} />
          </SectionCard>
        </div>
      </div>
    </>
  );
}
