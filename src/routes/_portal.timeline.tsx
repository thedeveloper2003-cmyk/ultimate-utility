import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { startOfDay } from "date-fns";
import { Coffee, LogIn, LogOut, Timer } from "lucide-react";
import { PageHeader, SectionCard, EmptyState, StatusBadge } from "@/components/portal/primitives";
import { DateNavigator, TimelineView } from "@/components/portal/widgets";
import { BlockDetail, DayTimeline } from "@/components/portal/day-timeline";
import { Button } from "@/components/ui/button";
import { attendanceMarkers, currentEmployee, dateKey, fmtDuration, fmtTime, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/timeline")({
  head: () => ({
    meta: [
      { title: "Daily Timeline — Protechsoft Employee Portal" },
      { name: "description", content: "Hour-by-hour view of your working day with real check-in, lunch and logout times from attendance." },
      { property: "og:title", content: "Daily Timeline — Protechsoft Employee Portal" },
      { property: "og:description", content: "Hour-by-hour view of your working day with real recorded attendance times." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function MarkerTile({
  icon: Icon, label, value, hint, tone,
}: { icon: typeof Timer; label: string; value: string; hint: string; tone: string }) {
  return (
    <div className="surface-card flex items-start gap-3 p-3">
      <span className={`rounded-lg p-2 ${tone}`}><Icon className="h-4 w-4" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="tabular text-base font-semibold">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function Page() {
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const key = dateKey(date);

  const blocks = useMemo(
    () => state.timeline.filter((b) => b.date === key && b.employeeId === me?.employeeId),
    [state.timeline, key, me?.employeeId],
  );
  const markers = useMemo(() => attendanceMarkers(state, key), [state, key]);
  const selected = blocks.find((b) => b.id === selectedId) ?? blocks[0];

  return (
    <>
      <PageHeader
        title="Daily Timeline"
        description="Chronological view of your day, built from the times actually recorded in attendance."
        actions={markers.status ? <StatusBadge value={markers.status} /> : null}
      />

      <div className="space-y-4">
        <DateNavigator value={date} onChange={setDate} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MarkerTile
            icon={LogIn} label="Recorded check-in" value={fmtTime(markers.checkIn)}
            hint={markers.checkIn ? "From attendance sign-in" : "No check-in recorded"}
            tone="bg-info/10 text-info"
          />
          <MarkerTile
            icon={Coffee} label="Lunch / break" value={fmtTime(markers.lunchStart)}
            hint={markers.breakMinutes ? `${markers.breakMinutes} min recorded${markers.lunchEnd ? ` · back ${fmtTime(markers.lunchEnd)}` : ""}` : "No break recorded"}
            tone="bg-warning/15 text-warning"
          />
          <MarkerTile
            icon={LogOut} label={markers.logout ? "Recorded logout" : "Expected logout"}
            value={fmtTime(markers.logout ?? markers.expected)}
            hint={markers.logout ? "Attendance finalised" : "9-hour working day"}
            tone="bg-success/10 text-success"
          />
          <MarkerTile
            icon={Timer} label="Worked" value={fmtDuration(markers.workedMinutes)}
            hint={markers.workStatus ?? "Not started"}
            tone="bg-primary/10 text-primary"
          />
        </div>

        <DayTimeline
          date={date}
          blocks={blocks}
          markers={markers}
          onChangeDate={setDate}
          selectedId={selected?.id}
          onSelect={(b) => setSelectedId(b.id)}
        />

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <SectionCard title="Block details" subtitle="Selected timeline entry">
            {selected ? (
              <div className="space-y-4">
                <BlockDetail block={selected} />
                <div className="flex flex-wrap gap-2">
                  {selected.taskId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/tasks/$taskId" params={{ taskId: selected.taskId }}>Open task</Link>
                    </Button>
                  ) : null}
                  {selected.meetingId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/meetings/$meetingId" params={{ meetingId: selected.meetingId }}>Open meeting</Link>
                    </Button>
                  ) : null}
                  {selected.projectId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/projects/$projectId" params={{ projectId: selected.projectId }}>Open project</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <EmptyState title="No block selected" message="Pick a block from the timeline above to see its details." />
            )}
          </SectionCard>

          <SectionCard title="Agenda list" subtitle={`${blocks.length} entries on ${key}`}>
            <TimelineView blocks={blocks} />
          </SectionCard>
        </div>
      </div>
    </>
  );
}
