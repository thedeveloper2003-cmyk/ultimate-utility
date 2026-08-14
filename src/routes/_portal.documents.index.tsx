import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Upload, Archive } from "lucide-react";
import { PageHeader, SectionCard, EmptyState } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { archiveDocument, fmtDateTime, uploadDocument, usePortal } from "@/lib/portal/store";
import type { DocumentItem } from "@/lib/portal/types";

export const Route = createFileRoute("/_portal/documents/")({
  head: () => ({
    meta: [
      { title: "Documents — Protechsoft Employee Portal" },
      { name: "description", content: "Personal, team, project and policy documents with version history, upload and archive." },
      { property: "og:title", content: "Documents — Protechsoft Employee Portal" },
      { property: "og:description", content: "Documents with version history and category filters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const CATEGORIES: DocumentItem["category"][] = [
  "My Documents", "Shared Documents", "Team Documents", "Organization Documents", "Project Documents", "Policies", "Templates",
];

function UploadDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentItem["category"]>("My Documents");
  const [fileType, setFileType] = useState("pdf");

  const submit = () => {
    if (!name.trim()) { toast.error("Give the document a name."); return; }
    uploadDocument({ name: name.trim(), category, fileType });
    toast.success("Document uploaded");
    setName(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Upload className="mr-1.5 h-4 w-4" />Upload</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
          <DialogDescription>Documents are versioned automatically from v1.0.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="doc-name">Document name</Label>
            <Input id="doc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Q3 Handover Notes" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as DocumentItem["category"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>File type</Label>
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["pdf", "docx", "xlsx", "pptx", "png", "md"].map((t) => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Page() {
  const state = usePortal((s) => s);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.documents
      .filter((d) => (showArchived ? true : !d.archived))
      .filter((d) => (category === "all" ? true : d.category === category))
      .filter((d) => (!q ? true : d.name.toLowerCase().includes(q)))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [state.documents, category, query, showArchived]);

  return (
    <>
      <PageHeader
        title="Documents"
        description="Your files plus team, project, policy and template libraries."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowArchived((v) => !v)}>
              <Archive className="mr-1.5 h-4 w-4" />{showArchived ? "Hide archived" : "Show archived"}
            </Button>
            <UploadDialog />
          </>
        }
      />

      <SectionCard
        title="Library"
        subtitle={`${docs.length} documents`}
        action={
          <div className="flex items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="h-9 w-48" placeholder="Search documents…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        }
      >
        {docs.length === 0 ? (
          <EmptyState title="No documents" message="Upload a file or clear the filters to see the library." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((d) => (
                  <TableRow key={d.documentId} className={d.archived ? "opacity-60" : ""}>
                    <TableCell>
                      <Link to="/documents/$documentId" params={{ documentId: d.documentId }} className="text-sm font-medium hover:underline">{d.name}</Link>
                      {d.archived ? <Badge variant="outline" className="ml-2 rounded-full text-[10px]">Archived</Badge> : null}
                    </TableCell>
                    <TableCell className="text-xs">{d.category}</TableCell>
                    <TableCell className="text-xs uppercase">{d.fileType}</TableCell>
                    <TableCell className="tabular text-xs">{d.sizeKb} KB</TableCell>
                    <TableCell className="tabular text-xs">{d.version}</TableCell>
                    <TableCell className="tabular text-xs">{fmtDateTime(d.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      {!d.archived ? (
                        <Button variant="ghost" size="sm" onClick={() => { archiveDocument(d.documentId); toast.success("Document archived"); }}>Archive</Button>
                      ) : null}
                    </TableCell>
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
