import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, SectionCard, EmptyState, StatusBadge } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createRequest, currentEmployee, fmtDateTime, usePortal } from "@/lib/portal/store";
import type { EmployeeRequest, Priority } from "@/lib/portal/types";

export const Route = createFileRoute("/_portal/requests/")({
  head: () => ({
    meta: [
      { title: "Requests & Support — Protechsoft Employee Portal" },
      { name: "description", content: "Raise IT, access, hardware and facility requests and follow their status through resolution." },
      { property: "og:title", content: "Requests & Support — Protechsoft Employee Portal" },
      { property: "og:description", content: "Raise and track service requests end to end." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CATEGORIES: EmployeeRequest["category"][] = [
  "IT Support", "Software Access", "Hardware", "Application Access", "Facility", "Security", "Workspace", "Business Service",
];
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const OPEN: string[] = ["Submitted", "Received", "Assigned", "In Progress", "Waiting for Employee"];

function NewRequestDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EmployeeRequest["category"]>("IT Support");
  const [priority, setPriority] = useState<Priority>("Medium");

  const submit = () => {
    if (!title.trim()) { toast.error("Add a short title for your request."); return; }
    createRequest({ category, title: title.trim(), description: description.trim(), priority });
    toast.success("Request submitted", { description: "Support will pick it up shortly." });
    setTitle(""); setDescription(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" />New request</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise a request</DialogTitle>
          <DialogDescription>Describe what you need. You can track progress from this page.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="rq-title">Title</Label>
            <Input id="rq-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Laptop replacement" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as EmployeeRequest["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rq-desc">Details</Label>
            <Textarea id="rq-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is the issue and what have you tried?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Submit request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [tab, setTab] = useState("open");

  const mine = useMemo(
    () => state.requests.filter((r) => r.employeeId === me?.employeeId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [state.requests, me?.employeeId],
  );
  const items = tab === "open" ? mine.filter((r) => OPEN.includes(r.status)) : tab === "closed" ? mine.filter((r) => !OPEN.includes(r.status)) : mine;

  return (
    <>
      <PageHeader
        title="Requests & Support"
        description="Service desk for IT, access, hardware, facilities and business services."
        actions={<NewRequestDialog />}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open requests", value: mine.filter((r) => OPEN.includes(r.status)).length },
          { label: "Resolved", value: mine.filter((r) => r.status === "Resolved" || r.status === "Closed").length },
          { label: "Total raised", value: mine.length },
        ].map((k) => (
          <div key={k.label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="tabular text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <SectionCard title="My requests" subtitle={`${items.length} requests`}>
        {items.length === 0 ? (
          <EmptyState title="No requests" message="Raise a request and it will appear here with a full status history." />
        ) : (
          <div className="space-y-2">
            {items.map((r) => (
              <Link key={r.requestId} to="/requests/$requestId" params={{ requestId: r.requestId }} className="block rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{r.title}</p>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge value={r.priority} />
                    <StatusBadge value={r.status} />
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                <p className="tabular mt-1 text-[11px] text-muted-foreground">{r.category} · updated {fmtDateTime(r.updatedAt)} · {r.history.length} status changes</p>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
