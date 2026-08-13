import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/meetings/")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Meetings" description="Upcoming and past meetings." />
      <SectionCard title="Meetings" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Meetings arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
