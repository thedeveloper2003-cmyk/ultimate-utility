import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/team")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="My Team" description="Your reporting line and peers." />
      <SectionCard title="My Team" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for My Team arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
