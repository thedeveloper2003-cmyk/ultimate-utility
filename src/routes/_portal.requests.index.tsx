import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/requests/")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="My Requests" description="Workspace and service requests." />
      <SectionCard title="My Requests" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for My Requests arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
