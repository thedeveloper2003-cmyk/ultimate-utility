import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard, EmptyState, EmployeeAvatar, StatusBadge } from "@/components/portal/primitives";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { currentEmployee, dateKey, fmtDate, fmtTime, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/meetings/")({
  head: () => ({
    meta: [
      { title: "Meetings — Nexora Employee Portal" },
      { name: "description", content: "Upcoming, today's and past meetings with organiser, participants, agenda and join links." },
      { property: "og:title", content: "Meetings — Nexora Employee Portal" },
      { property: "og:description", content: "Your meetings with agenda, participants and join links." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const today = dateKey(new Date());
  const [tab, setTab] = useState("upcoming");
  const [query, setQuery] = useState("");

  const mine = useMemo(
    () => state.meetings.filter((m) => m.participantIds.includes(me?.employeeId ?? "") || m.organizerId === me?.employeeId),
    [state.meetings, me?.employeeId],
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scoped =
      tab === "today" ? mine.filter((m) => m.date === today)
      : tab === "past" ? mine.filter((m) => m.date < today)
      : mine.filter((m) => m.date >= today);
    return scoped
      .filter((m) => (!q ? true : (m.title + m.location + m.description).toLowerCase().includes(q)))
      .sort((a, b) => (tab === "past" ? b.startTime.localeCompare(a.startTime) : a.startTime.localeCompare(b.startTime)));
  }, [mine, tab, today, query]);

  return (
    <>
      <PageHeader
        title="Meetings"
        description="Every meeting you organise or attend, with agenda and participants."
        actions={<Input className="h-9 w-56" placeholder="Search meetings…" value={query} onChange={(e) => setQuery(e.target.value)} />}
      />

      <div className="mb-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="today">Today ({mine.filter((m) => m.date === today).length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <SectionCard title="Schedule" subtitle={`${items.length} meetings`}>
        {items.length === 0 ? (
          <EmptyState title="No meetings" message="Nothing matches this filter." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((m) => {
              const organizer = state.employees.find((e) => e.employeeId === m.organizerId);
              return (
                <article key={m.meetingId} className="surface-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to="/meetings/$meetingId" params={{ meetingId: m.meetingId }} className="text-sm font-semibold hover:underline">{m.title}</Link>
                      <p className="tabular text-xs text-muted-foreground">{fmtDate(m.date + "T00:00:00.000Z")} · {fmtTime(m.startTime)} – {fmtTime(m.endTime)}</p>
                      <p className="text-[11px] text-muted-foreground">{m.location}</p>
                    </div>
                    <StatusBadge value={m.status} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex -space-x-2">
                      {m.participantIds.slice(0, 4).map((id) => {
                        const p = state.employees.find((e) => e.employeeId === id);
                        return p ? <EmployeeAvatar key={id} name={p.displayName} size="sm" /> : null;
                      })}
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">Organised by {organizer?.displayName ?? m.organizerId}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </>
  );
}
