import { useMemo, useRef } from "react";
import { addDays, differenceInMinutes, format, parseISO, startOfDay } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Coffee, LogOut, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./primitives";
import { fmtDuration, fmtTime } from "@/lib/portal/store";
import type { AttendanceMarkers } from "@/lib/portal/store";

const niceDur = (m: number) => (m < 60 ? `${m}m` : m % 60 === 0 ? `${m / 60}hr` : `${Math.floor(m / 60)}h ${m % 60}m`);
import type { TimelineBlock } from "@/lib/portal/types";

const TONE: Record<string, { bar: string; ring: string; chip: string }> = {
  LOGIN: { bar: "from-info/25 to-info/5", ring: "border-info/40", chip: "bg-info/15 text-info" },
  TASK: { bar: "from-primary/25 to-primary/5", ring: "border-primary/40", chip: "bg-primary/15 text-primary" },
  PROJECT: { bar: "from-primary/25 to-primary/5", ring: "border-primary/40", chip: "bg-primary/15 text-primary" },
  MEETING: { bar: "from-success/25 to-success/5", ring: "border-success/40", chip: "bg-success/15 text-success" },
  BREAK: { bar: "from-warning/25 to-warning/5", ring: "border-warning/40", chip: "bg-warning/15 text-warning" },
  FOCUS: { bar: "from-success/25 to-success/5", ring: "border-success/40", chip: "bg-success/15 text-success" },
  TRAINING: { bar: "from-info/25 to-info/5", ring: "border-info/40", chip: "bg-info/15 text-info" },
  EVENT: { bar: "from-accent/40 to-accent/5", ring: "border-accent", chip: "bg-accent text-accent-foreground" },
  OTHER: { bar: "from-muted to-transparent", ring: "border-border", chip: "bg-muted text-muted-foreground" },
};

const PX_PER_MIN = 2.4;
const MIN_WIDTH = 150;

function duration(b: TimelineBlock) {
  return Math.max(0, differenceInMinutes(parseISO(b.endTime), parseISO(b.startTime)));
}

export function DayTimeline({
  date,
  blocks,
  onChangeDate,
  selectedId,
  onSelect,
  markers,
}: {
  date: Date;
  blocks: TimelineBlock[];
  onChangeDate: (d: Date) => void;
  selectedId?: string | undefined;
  onSelect?: ((b: TimelineBlock) => void) | undefined;
  markers?: AttendanceMarkers | undefined;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [blocks],
  );

  const { hours, startMin, endMin } = useMemo(() => {
    if (sorted.length === 0) return { hours: [] as Date[], startMin: 0, endMin: 0 };
    const first = parseISO(sorted[0]!.startTime);
    const last = sorted.reduce(
      (acc, b) => (parseISO(b.endTime) > acc ? parseISO(b.endTime) : acc),
      parseISO(sorted[0]!.endTime),
    );
    const base = startOfDay(first);
    const s = Math.floor(differenceInMinutes(first, base) / 60) * 60;
    const e = Math.ceil(differenceInMinutes(last, base) / 60) * 60;
    const marks: Date[] = [];
    for (let m = s; m <= e; m += 60) marks.push(new Date(base.getTime() + m * 60000));
    return { hours: marks, startMin: s, endMin: e };
  }, [sorted]);

  const loginBlock = sorted.find((b) => b.type === "LOGIN");
  const lastBlock = sorted.length ? sorted[sorted.length - 1] : undefined;
  const startAt = markers?.checkIn ?? loginBlock?.startTime ?? null;
  const lunchAt = markers?.lunchStart ?? sorted.find((b) => b.type === "BREAK")?.startTime ?? null;
  const logoutAt = markers?.logout ?? markers?.expected ?? lastBlock?.endTime ?? null;
  const logoutProjected = !markers?.logout;

  const totalWidth = Math.max((endMin - startMin) * PX_PER_MIN, sorted.length * MIN_WIDTH);

  const scrollBy = (dir: number) => scroller.current?.scrollBy({ left: dir * 420, behavior: "smooth" });

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold leading-tight">Daily Timeline</h2>
            <p className="text-xs text-muted-foreground">{format(date, "EEEE, dd MMM yyyy")}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Marker icon={<Play className="h-3.5 w-3.5" />} label={`Start ${fmtTime(startAt)}`} tone="text-info" />
          <Marker
            icon={<Coffee className="h-3.5 w-3.5" />}
            label={lunchAt ? `Lunch ${fmtTime(lunchAt)}${markers?.breakMinutes ? ` · ${markers.breakMinutes}m` : ""}` : "Lunch not recorded"}
            tone="text-warning"
          />
          <Marker
            icon={<LogOut className="h-3.5 w-3.5" />}
            label={`${logoutProjected ? "Expected out" : "Logout"} ${fmtTime(logoutAt)}`}
            tone="text-success"
          />
          <div className="flex items-center rounded-md border border-border">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Previous day" onClick={() => onChangeDate(addDays(date, -1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Next day" onClick={() => onChangeDate(addDays(date, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nothing scheduled for this day. Sign-in, tasks, meetings and breaks appear here automatically.
        </p>
      ) : (
        <div className="relative mt-4">
          <div ref={scroller} className="overflow-x-auto pb-2">
            <div style={{ width: totalWidth }} className="min-w-full">
              {/* hour ruler */}
              <div className="relative mb-2 h-6 border-b border-border">
                {hours.map((h, i) => (
                  <span
                    key={i}
                    className={`tabular absolute text-[10px] font-medium text-muted-foreground ${i === 0 ? "" : "-translate-x-1/2"}`}
                    style={{ left: `${((differenceInMinutes(h, startOfDay(h)) - startMin) / Math.max(1, endMin - startMin)) * 100}%` }}
                  >
                    {format(h, "h:mm a")}
                  </span>
                ))}
              </div>

              {/* blocks */}
              <div className="flex gap-2">
                {sorted.map((b) => {
                  const tone = TONE[b.type] ?? TONE["OTHER"]!;
                  const mins = duration(b);
                  const active = selectedId === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => onSelect?.(b)}
                      style={{ width: Math.max(mins * PX_PER_MIN, MIN_WIDTH), flex: "0 0 auto" }}
                      className={`group relative overflow-hidden rounded-lg border bg-gradient-to-br p-3 text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tone.bar} ${tone.ring} ${active ? "ring-2 ring-ring" : ""}`}
                    >
                      <p className="truncate text-sm font-semibold text-foreground">{b.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{b.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="tabular text-[11px] font-medium text-muted-foreground">
                          {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone.chip}`}>
                          {mins > 0 ? niceDur(mins) : b.type}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {["LOGIN", "TASK", "MEETING", "BREAK", "FOCUS"].map((t) => (
                <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${(TONE[t] ?? TONE["OTHER"]!).chip}`}>{t}</span>
              ))}
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Scroll timeline left" onClick={() => scrollBy(-1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Scroll timeline right" onClick={() => scrollBy(1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Marker({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
      <span className={tone}>{icon}</span>
      {label}
    </span>
  );
}

export function BlockDetail({ block }: { block: TimelineBlock }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{block.title}</p>
          <p className="tabular text-xs text-muted-foreground">
            {fmtTime(block.startTime)} – {fmtTime(block.endTime)} · {fmtDuration(duration(block))}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge value={block.type} tone="neutral" />
          <StatusBadge value={block.status} />
          <StatusBadge value={block.priority} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{block.description}</p>
    </div>
  );
}
