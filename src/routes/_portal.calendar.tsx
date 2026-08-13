import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/calendar")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Calendar" description="Meetings, deadlines and events." />
      <SectionCard title="Calendar" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Calendar arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
