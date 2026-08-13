import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { differenceInMinutes, format, parseISO, subDays } from "date-fns";
import { Clock, Coffee, LogIn, LogOut } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  attendanceMarkers, dateKey, fmtDuration, fmtTime, setWorkStatus, todaysAttendance, usePortal, workProgress,
} from "@/lib/portal/store";
import type { WorkStatus } from "@/lib/portal/types";

export const Route = createFileRoute("/_portal/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Nexora Employee Portal" },
      { name: "description", content: "Check-in time, lunch breaks, working hours and attendance history for the last 90 days." },
      { property: "og:title", content: "Attendance — Nexora Employee Portal" },
      { property: "og:description", content: "Check-in time, lunch breaks, working hours and attendance history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const WORK_STATUSES: WorkStatus[] = ["Working", "On Break", "Focus Time", "Work Completed"];

function Page() {
  const state = usePortal((s) => s);
  const [days, setDays] = useState(30);
  const today = dateKey(new Date());
  const markers = useMemo(() => attendanceMarkers(state, today), [state, today]);
  const attendanceToday = todaysAttendance(state);
  const progress = workProgress(markers.checkIn, new Date());

  const rows = useMemo(() => {
    const from = dateKey(subDays(new Date(), days));
    return state.attendance
      .filter((a) => a.date >= from && a.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.attendance, days, today]);

  const worked = rows.filter((r) => r.status === "Present" || r.status === "Remote");
  const avgWorked = worked.length
    ? Math.round(worked.reduce((sum, r) => sum + (r.workDurationMinutes || 0), 0) / worked.length)
    : 0;
  const avgCheckIn = worked.filter((r) => r.checkInTime).length
    ? Math.round(
        worked.filter((r) => r.checkInTime).reduce((sum, r) => sum + differenceInMinutes(parseISO(r.checkInTime!), parseISO(r.date + "T00:00:00.000Z")), 0) /
          worked.filter((r) => r.checkInTime).length,
      )
    : 0;
  const totalBreaks = rows.reduce((sum, r) => sum + (r.breakDurationMinutes || 0), 0);

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Your check-in, break and logout record. Times are captured automatically at portal sign-in and sign-out."
        actions={<StatusBadge value={attendanceToday?.status ?? "Present"} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Today" subtitle="Live working day" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-4">
            <Metric icon={LogIn} label="Checked in" value={fmtTime(markers.checkIn)} hint="Recorded at sign-in" />
            <Metric icon={Coffee} label="Lunch" value={fmtTime(markers.lunchStart)} hint={markers.breakMinutes ? `${markers.breakMinutes} min break` : "Not taken"} />
            <Metric icon={LogOut} label={markers.logout ? "Logged out" : "Expected out"} value={fmtTime(markers.logout ?? markers.expected)} hint={markers.logout ? "Finalised" : "9-hour day"} />
            <Metric icon={Clock} label="Worked" value={fmtDuration(markers.workedMinutes)} hint={`${progress.percent}% of the day`} />
          </div>
          <Progress value={progress.percent} className="mt-4 h-2" aria-label={`Working day ${progress.percent}% complete`} />
          <div className="mt-4 flex flex-wrap gap-2">
            {WORK_STATUSES.map((w) => (
              <Button
                key={w}
                size="sm"
                variant={attendanceToday?.workStatus === w ? "default" : "outline"}
                onClick={() => setWorkStatus(w)}
              >
                {w}
              </Button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Period summary" subtitle={`Last ${days} days`}>
          <dl className="space-y-3 text-sm">
            <Row label="Days present" value={`${worked.length} of ${rows.length}`} />
            <Row label="Average check-in" value={avgCheckIn ? format(new Date(2020, 0, 1, Math.floor(avgCheckIn / 60), avgCheckIn % 60), "hh:mm a") : "—"} />
            <Row label="Average worked" value={fmtDuration(avgWorked)} />
            <Row label="Total break time" value={fmtDuration(totalBreaks)} />
            <Row label="Leave / absent" value={String(rows.filter((r) => r.status === "Leave" || r.status === "Absent").length)} />
          </dl>
        </SectionCard>
      </div>

      <SectionCard
        title="Attendance history"
        subtitle="Recorded check-in, break and logout times"
        className="mt-4"
        action={
          <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <TabsList>
              {RANGES.map((r) => <TabsTrigger key={r.days} value={String(r.days)}>{r.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        }
      >
        {rows.length === 0 ? (
          <EmptyState title="No attendance records" message="Nothing was recorded in this period." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Expected out</TableHead>
                  <TableHead>Logout</TableHead>
                  <TableHead>Worked</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.attendanceId}>
                    <TableCell className="tabular font-medium">{format(parseISO(a.date + "T00:00:00.000Z"), "EEE, dd MMM")}</TableCell>
                    <TableCell className="tabular">{fmtTime(a.checkInTime)}</TableCell>
                    <TableCell className="tabular">{fmtTime(a.expectedCompletionTime)}</TableCell>
                    <TableCell className="tabular">{fmtTime(a.actualLogoutTime)}</TableCell>
                    <TableCell className="tabular">{a.workDurationMinutes ? fmtDuration(a.workDurationMinutes) : "—"}</TableCell>
                    <TableCell className="tabular">{a.breakDurationMinutes ? `${a.breakDurationMinutes}m` : "—"}</TableCell>
                    <TableCell><StatusBadge value={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </>
  );
}

function Metric({ icon: Icon, label, value, hint }: { icon: typeof Clock; label: string; value: string; hint: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="tabular text-base font-semibold">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="tabular text-sm font-medium">{value}</dd>
    </div>
  );
}
