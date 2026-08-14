import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LifeBuoy, Mail, Phone, BookOpen, TicketCheck } from "lucide-react";
import { PageHeader, SectionCard, EmptyState } from "@/components/portal/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — Protechsoft Employee Portal" },
      { name: "description", content: "FAQs, support contacts, escalation paths and shortcuts to raise a request or read a guide." },
      { property: "og:title", content: "Help & Support — Protechsoft Employee Portal" },
      { property: "og:description", content: "FAQs, contacts and escalation paths for employee support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const FAQS = [
  { q: "How is my attendance recorded?", a: "Check-in is captured automatically when you sign in. Your expected completion time is nine hours after check-in, minus recorded break time. You can adjust your work status (Working, On Break, Focus Time) from the Attendance screen." },
  { q: "How do I raise an IT or access request?", a: "Open Requests & Support, choose New request, pick a category such as IT Support or Application Access, and submit. Every status change is recorded in the request history." },
  { q: "Who approves my submissions?", a: "Submissions route to your reporting manager by default. You can follow their status under Approvals → My submissions." },
  { q: "Why can't I see a colleague in the directory?", a: "Colleagues can hide themselves from directory search in Settings → Privacy & security. Their presence indicator is also hidden when presence visibility is off." },
  { q: "How do document versions work?", a: "Every upload starts at v1.0 and each replacement increments the version. Open a document to review its full version history with notes." },
  { q: "How do I change the portal theme?", a: "Settings → Appearance & locale lets you pick Light, Dark or Match system. The choice is saved to your profile and applies on every device." },
];

const CONTACTS = [
  { team: "IT Service Desk", detail: "itdesk@protechsoft.example", phone: "+44 20 7946 0111", hours: "24/7", icon: LifeBuoy },
  { team: "People & HR", detail: "people@protechsoft.example", phone: "+44 20 7946 0122", hours: "Mon–Fri, 09:00–18:00", icon: Mail },
  { team: "Facilities", detail: "facilities@protechsoft.example", phone: "+44 20 7946 0133", hours: "Mon–Fri, 08:00–19:00", icon: Phone },
];

function Page() {
  const state = usePortal((s) => s);
  const [query, setQuery] = useState("");

  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => (!q ? true : (f.q + f.a).toLowerCase().includes(q)));
  }, [query]);

  const guides = state.knowledge.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Help & Support"
        description="Find an answer, read a guide or reach the right team directly."
        actions={<Input className="h-9 w-64" placeholder="Search help topics…" value={query} onChange={(e) => setQuery(e.target.value)} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Frequently asked questions" subtitle={`${faqs.length} topics`} className="lg:col-span-2">
          {faqs.length === 0 ? (
            <EmptyState title="No matching answers" message="Try different keywords, or raise a request so someone can help." action={<Button asChild size="sm"><Link to="/requests">Raise a request</Link></Button>} />
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-xs leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Contact support" subtitle="Escalation paths by team">
            <ul className="space-y-2">
              {CONTACTS.map((c) => (
                <li key={c.team} className="rounded-md border border-border p-3">
                  <p className="flex items-center gap-1.5 text-sm font-medium"><c.icon className="h-3.5 w-3.5 text-primary" />{c.team}</p>
                  <p className="text-[11px] text-muted-foreground">{c.detail} · {c.phone}</p>
                  <p className="text-[11px] text-muted-foreground">Hours: {c.hours}</p>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Quick actions" subtitle="Common next steps">
            <div className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start"><Link to="/requests"><TicketCheck className="mr-1.5 h-3.5 w-3.5" />Raise a support request</Link></Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start"><Link to="/knowledge"><BookOpen className="mr-1.5 h-3.5 w-3.5" />Browse the knowledge base</Link></Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start"><Link to="/settings"><LifeBuoy className="mr-1.5 h-3.5 w-3.5" />Review my settings</Link></Button>
            </div>
          </SectionCard>

          <SectionCard title="Popular guides" subtitle="From the knowledge base">
            <ul className="space-y-1.5">
              {guides.map((g) => (
                <li key={g.articleId}>
                  <Link to="/knowledge" className="text-xs text-primary hover:underline">{g.title}</Link>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">{g.summary}</p>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
