import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/timeline")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Daily Timeline" description="Chronological view of your day." />
      <SectionCard title="Daily Timeline" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Daily Timeline arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
