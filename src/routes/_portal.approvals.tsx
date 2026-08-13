import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { PageHeader, SectionCard, EmptyState, StatusBadge, EmployeeAvatar } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { currentEmployee, decideApproval, fmtDateTime, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — Nexora Employee Portal" },
      { name: "description", content: "Approve, reject or request changes on submissions waiting on you, and follow your own submissions." },
      { property: "og:title", content: "Approvals — Nexora Employee Portal" },
      { property: "og:description", content: "Decide on pending approvals and track your submissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [tab, setTab] = useState("inbox");

  const inbox = useMemo(
    () => state.approvals.filter((a) => a.approverId === me?.employeeId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [state.approvals, me?.employeeId],
  );
  const submitted = useMemo(
    () => state.approvals.filter((a) => a.requesterId === me?.employeeId).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [state.approvals, me?.employeeId],
  );

  const items = tab === "inbox" ? inbox : submitted;
  const decide = (id: string, decision: "Approved" | "Rejected" | "Changes Requested") => {
    decideApproval(id, decision);
    toast.success(`Marked as ${decision.toLowerCase()}`);
  };

  return (
    <>
      <PageHeader title="Approvals" description="Decisions waiting on you and the status of everything you submitted." />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Awaiting my decision", value: inbox.filter((a) => a.status === "Pending").length },
          { label: "Decided by me", value: inbox.filter((a) => a.status !== "Pending").length },
          { label: "My submissions open", value: submitted.filter((a) => a.status === "Pending").length },
        ].map((k) => (
          <div key={k.label} className="surface-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="tabular text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="inbox">Approval inbox ({inbox.length})</TabsTrigger>
          <TabsTrigger value="submitted">My submissions ({submitted.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <SectionCard title={tab === "inbox" ? "Requests for your decision" : "Submissions you raised"} subtitle={`${items.length} items`}>
        {items.length === 0 ? (
          <EmptyState title="Nothing here" message="There are no approval items in this view." />
        ) : (
          <div className="space-y-2">
            {items.map((a) => {
              const counterpartId = tab === "inbox" ? a.requesterId : a.approverId;
              const person = state.employees.find((e) => e.employeeId === counterpartId);
              return (
                <article key={a.approvalId} className="rounded-md border border-border bg-card p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      {person ? <EmployeeAvatar name={person.displayName} size="sm" /> : null}
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.type} · {tab === "inbox" ? "from" : "approver"} {person?.displayName ?? counterpartId} · submitted {fmtDateTime(a.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge value={a.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{a.summary}</p>
                  {tab === "inbox" && a.status === "Pending" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => decide(a.approvalId, "Approved")}><Check className="mr-1.5 h-3.5 w-3.5" />Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => decide(a.approvalId, "Changes Requested")}><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Request changes</Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => decide(a.approvalId, "Rejected")}><X className="mr-1.5 h-3.5 w-3.5" />Reject</Button>
                    </div>
                  ) : a.decidedAt ? (
                    <p className="tabular mt-2 text-[11px] text-muted-foreground">Decided {fmtDateTime(a.decidedAt)}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>
    </>
  );
}
