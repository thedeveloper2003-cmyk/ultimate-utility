import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pin, PinOff, Archive, ArchiveRestore, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard, EmptyState, StatusBadge } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentEmployee, deleteNote, fmtDateTime, saveNote, toggleNote, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/notes")({
  head: () => ({
    meta: [
      { title: "My Notes — Nexora Employee Portal" },
      { name: "description", content: "Capture personal notes, meeting takeaways and drafts. Pin what matters and archive the rest." },
      { property: "og:title", content: "My Notes — Nexora Employee Portal" },
      { property: "og:description", content: "Personal notes, meeting takeaways and drafts in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const [tab, setTab] = useState("active");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "General" });

  const notes = useMemo(() => {
    const mine = state.notes.filter((n) => n.employeeId === me?.employeeId);
    const scoped = tab === "archived" ? mine.filter((n) => n.archived) : tab === "pinned" ? mine.filter((n) => n.pinned && !n.archived) : mine.filter((n) => !n.archived);
    const q = query.trim().toLowerCase();
    const filtered = q ? scoped.filter((n) => (n.title + n.content + n.category).toLowerCase().includes(q)) : scoped;
    return [...filtered].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [state.notes, me?.employeeId, tab, query]);

  const startNew = () => { setEditing(null); setForm({ title: "", content: "", category: "General" }); setOpen(true); };
  const startEdit = (id: string) => {
    const n = state.notes.find((x) => x.noteId === id);
    if (!n) return;
    setEditing(id);
    setForm({ title: n.title, content: n.content, category: n.category });
    setOpen(true);
  };
  const submit = () => {
    if (!form.title.trim()) { toast.error("Give the note a title."); return; }
    saveNote(editing ? { ...form, noteId: editing } : form);
    setOpen(false);
    toast.success(editing ? "Note updated." : "Note created.");
  };

  return (
    <>
      <PageHeader
        title="My Notes"
        description="Your private workspace for meeting takeaways, drafts and reminders to self."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={startNew}><Plus className="mr-1.5 h-4 w-4" />New note</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit note" : "New note"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="note-title">Title</Label>
                  <Input id="note-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sprint retro takeaways" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="note-category">Category</Label>
                  <Input id="note-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea id="note-content" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>{editing ? "Save changes" : "Create note"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input className="h-9 max-w-xs" placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <SectionCard title="Notes" subtitle={`${notes.length} notes`}>
        {notes.length === 0 ? (
          <EmptyState title="No notes here" message="Create a note to capture context you want to keep." action={<Button size="sm" onClick={startNew}>New note</Button>} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {notes.map((n) => (
              <article key={n.noteId} className="surface-card flex flex-col p-3">
                <div className="flex items-start justify-between gap-2">
                  <button className="text-left text-sm font-semibold hover:underline" onClick={() => startEdit(n.noteId)}>{n.title}</button>
                  <StatusBadge value={n.category} tone="neutral" />
                </div>
                <p className="mt-1 line-clamp-4 flex-1 text-xs text-muted-foreground">{n.content}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">Updated {fmtDateTime(n.updatedAt)}</p>
                <div className="mt-2 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={n.pinned ? "Unpin note" : "Pin note"} onClick={() => toggleNote(n.noteId, "pinned")}>
                    {n.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={n.archived ? "Restore note" : "Archive note"} onClick={() => toggleNote(n.noteId, "archived")}>
                    {n.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Delete note"
                    onClick={() => { deleteNote(n.noteId); toast.success("Note deleted."); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
