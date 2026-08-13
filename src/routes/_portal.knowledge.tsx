import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/knowledge")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Knowledge Base" description="Policies, guides and how-tos." />
      <SectionCard title="Knowledge Base" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Knowledge Base arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
