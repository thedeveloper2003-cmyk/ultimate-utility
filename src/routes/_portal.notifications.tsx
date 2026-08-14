import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { PageHeader, SectionCard, EmptyState } from "@/components/portal/primitives";
import { NotificationItem } from "@/components/portal/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentEmployee, readAllNotifications, readNotification, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Protechsoft Employee Portal" },
      { name: "description", content: "Task, meeting, approval and announcement notifications with read state and direct links to the source record." },
      { property: "og:title", content: "Notifications — Protechsoft Employee Portal" },
      { property: "og:description", content: "All portal notifications in one inbox." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const FILTERS = ["all", "unread", "task", "meeting", "approval", "system"];

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.notifications
      .filter((n) => n.employeeId === me?.employeeId)
      .filter((n) => (tab === "all" ? true : tab === "unread" ? !n.readAt : n.type === tab))
      .filter((n) => (!q ? true : (n.title + n.message).toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.notifications, me?.employeeId, tab, query]);

  const unread = state.notifications.filter((n) => n.employeeId === me?.employeeId && !n.readAt).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unread} unread of ${state.notifications.length} total. Opening a notification marks it read and takes you to the record.`}
        actions={<Button size="sm" variant="outline" onClick={() => readAllNotifications()}><CheckCheck className="mr-1.5 h-4 w-4" />Mark all read</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {FILTERS.map((f) => <TabsTrigger key={f} value={f} className="capitalize">{f}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <Input className="h-9 max-w-xs" placeholder="Search notifications…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <SectionCard title="Inbox" subtitle={`${items.length} notifications`}>
        {items.length === 0 ? (
          <EmptyState title="Inbox clear" message="No notifications match this filter." />
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <NotificationItem
                key={n.notificationId}
                n={n}
                onOpen={(item) => {
                  readNotification(item.notificationId);
                  if (item.actionUrl) void navigate({ to: item.actionUrl });
                }}
              />
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
