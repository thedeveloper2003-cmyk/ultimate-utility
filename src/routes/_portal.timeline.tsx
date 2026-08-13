import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { startOfDay } from "date-fns";
import { PageHeader, SectionCard, EmptyState } from "@/components/portal/primitives";
import { DateNavigator, TimelineView } from "@/components/portal/widgets";
import { BlockDetail, DayTimeline } from "@/components/portal/day-timeline";
import { Button } from "@/components/ui/button";
import { currentEmployee, dateKey, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/timeline")({
  component: Page,
});

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
  const selected = blocks.find((b) => b.id === selectedId) ?? blocks[0];

  return (
    <>
      <PageHeader title="Daily Timeline" description="Chronological view of your day, hour by hour." />

      <div className="space-y-4">
        <DateNavigator value={date} onChange={setDate} />

        <DayTimeline
          date={date}
          blocks={blocks}
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
