import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { PageHeader, SectionCard, EmptyState } from "@/components/portal/primitives";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fmtDate, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base — Nexora Employee Portal" },
      { name: "description", content: "Searchable guides, policies and how-to articles with tags, categories and related reading." },
      { property: "og:title", content: "Knowledge Base — Nexora Employee Portal" },
      { property: "og:description", content: "Guides, policies and how-to articles for employees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const state = usePortal((s) => s);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = useMemo(() => ["all", ...new Set(state.knowledge.map((a) => a.category))], [state.knowledge]);

  const articles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.knowledge
      .filter((a) => (category === "all" ? true : a.category === category))
      .filter((a) => (!q ? true : (a.title + a.summary + a.body + a.tags.join(" ")).toLowerCase().includes(q)))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [state.knowledge, category, query]);

  const selected = state.knowledge.find((a) => a.articleId === (openId ?? articles[0]?.articleId));
  const author = state.employees.find((e) => e.employeeId === selected?.authorId);
  const related = selected ? state.knowledge.filter((a) => selected.relatedIds.includes(a.articleId)) : [];

  return (
    <>
      <PageHeader
        title="Knowledge Base"
        description="Answers, policies and step-by-step guides maintained by IT, HR and team leads."
        actions={<Input className="h-9 w-64" placeholder="Search the knowledge base…" value={query} onChange={(e) => setQuery(e.target.value)} />}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <Button key={c} size="sm" variant={category === c ? "default" : "outline"} className="h-7 capitalize" onClick={() => setCategory(c)}>{c}</Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <SectionCard title="Articles" subtitle={`${articles.length} results`}>
          {articles.length === 0 ? (
            <EmptyState title="No articles" message="Try different keywords or another category." />
          ) : (
            <div className="space-y-2">
              {articles.map((a) => (
                <button
                  key={a.articleId}
                  onClick={() => setOpenId(a.articleId)}
                  className={`block w-full rounded-md border bg-card p-3 text-left transition-colors hover:border-primary/40 ${
                    selected?.articleId === a.articleId ? "border-primary/60" : "border-border"
                  }`}
                >
                  <p className="flex items-center gap-2 text-sm font-medium"><BookOpen className="h-3.5 w-3.5 text-primary" />{a.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{a.summary}</p>
                  <p className="tabular mt-1 text-[10px] text-muted-foreground">{a.category} · updated {fmtDate(a.updatedAt)}</p>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Article" subtitle={selected ? selected.category : "Nothing selected"}>
          {selected ? (
            <article>
              <h3 className="text-base font-semibold">{selected.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{author?.displayName ?? selected.authorId} · updated {fmtDate(selected.updatedAt)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.tags.map((t) => <Badge key={t} variant="secondary" className="rounded-full text-[10px]">#{t}</Badge>)}
              </div>
              <Separator className="my-3" />
              <p className="text-sm leading-relaxed whitespace-pre-line">{selected.body}</p>
              {related.length > 0 ? (
                <>
                  <Separator className="my-4" />
                  <p className="mb-2 text-xs font-semibold">Related reading</p>
                  <ul className="space-y-1.5">
                    {related.map((r) => (
                      <li key={r.articleId}>
                        <button className="text-xs text-primary hover:underline" onClick={() => setOpenId(r.articleId)}>{r.title}</button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </article>
          ) : (
            <EmptyState title="No article selected" message="Choose an article from the list to read it." />
          )}
        </SectionCard>
      </div>
    </>
  );
}
