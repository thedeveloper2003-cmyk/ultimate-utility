import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Award, Send } from "lucide-react";
import { PageHeader, SectionCard, EmptyState, EmployeeAvatar } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { currentEmployee, fmtDateTime, sendRecognition, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/recognition")({
  head: () => ({
    meta: [
      { title: "Recognition — Nexora Employee Portal" },
      { name: "description", content: "Give kudos to colleagues, review the badges you received and see the recognition leaderboard." },
      { property: "og:title", content: "Recognition — Nexora Employee Portal" },
      { property: "og:description", content: "Kudos, badges and the recognition leaderboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const BADGES = ["Team Player", "Problem Solver", "Customer Champion", "Mentor", "Innovator", "Above and Beyond"];

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [tab, setTab] = useState("received");
  const [toId, setToId] = useState("");
  const [badge, setBadge] = useState(BADGES[0]!);
  const [message, setMessage] = useState("");

  const colleagues = state.employees.filter((e) => e.employeeId !== me?.employeeId);
  const received = state.recognition.filter((r) => r.toId === me?.employeeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const given = state.recognition.filter((r) => r.fromId === me?.employeeId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const items = tab === "received" ? received : given;

  const leaderboard = useMemo(() => {
    const map = new Map<string, number>();
    state.recognition.forEach((r) => map.set(r.toId, (map.get(r.toId) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [state.recognition]);

  const submit = () => {
    if (!toId) { toast.error("Pick a colleague to recognise."); return; }
    if (!message.trim()) { toast.error("Add a short message."); return; }
    sendRecognition(toId, badge, message.trim());
    toast.success("Kudos sent");
    setMessage(""); setToId("");
  };

  return (
    <>
      <PageHeader title="Recognition" description="Celebrate great work across the organisation with badges and kudos." />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Give kudos" subtitle="Recognition is visible to the recipient">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Colleague</Label>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger><SelectValue placeholder="Select a colleague" /></SelectTrigger>
                <SelectContent>
                  {colleagues.map((e) => <SelectItem key={e.employeeId} value={e.employeeId}>{e.displayName} · {e.team}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Badge</Label>
              <Select value={badge} onValueChange={setBadge}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BADGES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kudos-msg">Message</Label>
              <Textarea id="kudos-msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Thanks for unblocking the release…" />
            </div>
            <Button className="w-full" onClick={submit}><Send className="mr-1.5 h-4 w-4" />Send recognition</Button>
          </div>
        </SectionCard>

        <SectionCard
          title="Kudos wall"
          subtitle={`${received.length} received · ${given.length} given`}
          className="lg:col-span-2"
          action={
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList><TabsTrigger value="received">Received</TabsTrigger><TabsTrigger value="given">Given</TabsTrigger></TabsList>
            </Tabs>
          }
        >
          {items.length === 0 ? (
            <EmptyState title="No recognition yet" message="Kudos you send and receive will appear here." />
          ) : (
            <div className="space-y-2">
              {items.map((r) => {
                const person = state.employees.find((e) => e.employeeId === (tab === "received" ? r.fromId : r.toId));
                return (
                  <article key={r.recognitionId} className="rounded-md border border-border bg-card p-3">
                    <div className="flex items-start gap-2">
                      {person ? <EmployeeAvatar name={person.displayName} size="sm" /> : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium">{tab === "received" ? `From ${person?.displayName ?? r.fromId}` : `To ${person?.displayName ?? r.toId}`}</p>
                          <Badge variant="outline" className="rounded-full border-warning/40 bg-warning/15 text-[10px] text-warning-foreground">
                            <Award className="mr-1 h-3 w-3" />{r.badge}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{r.message}</p>
                        <p className="tabular mt-1 text-[10px] text-muted-foreground">{fmtDateTime(r.createdAt)}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Leaderboard" subtitle="Most recognised colleagues">
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {leaderboard.map(([id, count], i) => {
              const e = state.employees.find((p) => p.employeeId === id);
              return (
                <li key={id} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                  <span className="tabular w-5 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                  {e ? <EmployeeAvatar name={e.displayName} size="sm" /> : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e?.displayName ?? id}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{e?.team}</p>
                  </div>
                  <span className="tabular flex items-center gap-1 text-sm font-semibold text-warning"><Award className="h-3.5 w-3.5" />{count}</span>
                </li>
              );
            })}
          </ol>
        </SectionCard>
      </div>
    </>
  );
}
