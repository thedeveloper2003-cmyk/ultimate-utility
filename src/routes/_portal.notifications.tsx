import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/notifications")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Notifications" description="All portal notifications." />
      <SectionCard title="Notifications" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Notifications arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
