import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/recognition")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Recognition" description="Badges and appreciation." />
      <SectionCard title="Recognition" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Recognition arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
