import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/notes")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="My Notes" description="Personal notes and drafts." />
      <SectionCard title="My Notes" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for My Notes arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
