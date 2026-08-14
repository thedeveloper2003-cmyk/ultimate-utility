import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard, EmptyState, StatusBadge } from "@/components/portal/primitives";
import { AnnouncementCard } from "@/components/portal/widgets";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { currentEmployee, fmtDate, readAnnouncement, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Protechsoft Employee Portal" },
      { name: "description", content: "Company, department and policy announcements with priority, publication window and read tracking." },
      { property: "og:title", content: "Announcements — Protechsoft Employee Portal" },
      { property: "og:description", content: "Company and department announcements with read tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useMemo(() => ["all", ...new Set(state.announcements.map((a) => a.category))], [state.announcements]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.announcements
      .filter((a) => (tab === "all" ? true : a.category === tab))
      .filter((a) => (!q ? true : (a.title + a.description).toLowerCase().includes(q)))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [state.announcements, tab, query]);

  const selected = state.announcements.find((a) => a.announcementId === (openId ?? items[0]?.announcementId));
  const author = state.employees.find((e) => e.employeeId === selected?.authorId);
  const isRead = (id: string) => state.announcements.find((a) => a.announcementId === id)?.readBy.includes(me?.employeeId ?? "") ?? false;

  return (
    <>
      <PageHeader title="Announcements" description="Official communication from leadership, HR, IT and your department." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>{categories.map((c) => <TabsTrigger key={c} value={c} className="capitalize">{c}</TabsTrigger>)}</TabsList>
        </Tabs>
        <Input className="h-9 max-w-xs" placeholder="Search announcements…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <SectionCard title="Feed" subtitle={`${items.length} announcements`}>
          {items.length === 0 ? (
            <EmptyState title="Nothing published" message="No announcements match this filter." />
          ) : (
            <div className="space-y-2">
              {items.map((a) => (
                <AnnouncementCard
                  key={a.announcementId}
                  a={a}
                  read={isRead(a.announcementId)}
                  onOpen={() => { setOpenId(a.announcementId); readAnnouncement(a.announcementId); }}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Detail" subtitle={selected ? selected.category : "Nothing selected"}>
          {selected ? (
            <article>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold">{selected.title}</h3>
                <StatusBadge value={selected.priority} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {author?.displayName ?? selected.authorId} · published {fmtDate(selected.publishedAt)} · expires {fmtDate(selected.expiresAt)}
              </p>
              <Separator className="my-3" />
              <p className="text-sm leading-relaxed text-foreground">{selected.description}</p>
              <p className="mt-4 text-[11px] text-muted-foreground">{selected.readBy.length} colleagues have read this announcement.</p>
            </article>
          ) : (
            <EmptyState title="No announcement selected" message="Pick an announcement from the feed to read it in full." />
          )}
        </SectionCard>
      </div>
    </>
  );
}
