import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Check, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard, EmptyState, StatusBadge } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createReminder, currentEmployee, dateKey, fmtDate, setReminderStatus, usePortal } from "@/lib/portal/store";
import type { Priority } from "@/lib/portal/types";

export const Route = createFileRoute("/_portal/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — Protechsoft Employee Portal" },
      { name: "description", content: "Personal reminders for deadlines, follow-ups and mandatory training with priority and due time." },
      { property: "og:title", content: "Reminders — Protechsoft Employee Portal" },
      { property: "og:description", content: "Personal reminders for deadlines, follow-ups and training." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const today = dateKey(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: today, time: "09:00", priority: "Medium" as Priority });

  const mine = useMemo(
    () => state.reminders.filter((r) => r.employeeId === me?.employeeId).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [state.reminders, me?.employeeId],
  );
  const pending = mine.filter((r) => r.status === "Pending");
  const groups = [
    { title: "Overdue", subtitle: "Past due and still pending", items: pending.filter((r) => r.date < today) },
    { title: "Today", subtitle: `Due ${fmtDate(today + "T00:00:00.000Z")}`, items: pending.filter((r) => r.date === today) },
    { title: "Upcoming", subtitle: "Scheduled ahead", items: pending.filter((r) => r.date > today) },
    { title: "Done & dismissed", subtitle: "Closed reminders", items: mine.filter((r) => r.status !== "Pending") },
  ];

  const submit = () => {
    if (!form.title.trim()) { toast.error("Give the reminder a title."); return; }
    createReminder(form);
    setOpen(false);
    setForm({ title: "", description: "", date: today, time: "09:00", priority: "Medium" });
    toast.success("Reminder scheduled.");
  };

  return (
    <>
      <PageHeader
        title="Reminders"
        description="Nudges for the things that are easy to forget — deadlines, follow-ups and compliance training."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" />New reminder</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New reminder</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rm-title">Title</Label>
                  <Input id="rm-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rm-desc">Description</Label>
                  <Textarea id="rm-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="rm-date">Date</Label>
                    <Input id="rm-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rm-time">Time</Label>
                    <Input id="rm-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rm-priority">Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                      <SelectTrigger id="rm-priority"><SelectValue /></SelectTrigger>
                      <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <SectionCard key={g.title} title={g.title} subtitle={g.subtitle}>
            {g.items.length === 0 ? (
              <EmptyState title="Nothing here" message="No reminders in this bucket." />
            ) : (
              <ul className="space-y-2">
                {g.items.map((r) => (
                  <li key={r.reminderId} className="surface-card flex items-start gap-3 p-3">
                    <span className="rounded-lg bg-primary/10 p-2 text-primary"><Bell className="h-4 w-4" aria-hidden /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{r.title}</p>
                        <div className="flex gap-1.5">
                          <StatusBadge value={r.priority} />
                          <StatusBadge value={r.status} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                      <p className="tabular mt-1 text-[11px] text-muted-foreground">{fmtDate(r.date + "T00:00:00.000Z")} at {r.time}</p>
                    </div>
                    {r.status === "Pending" ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Mark complete" onClick={() => { setReminderStatus(r.reminderId, "Completed"); toast.success("Reminder completed."); }}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Dismiss reminder" onClick={() => setReminderStatus(r.reminderId, "Dismissed")}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        ))}
      </div>
    </>
  );
}
