import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/activity")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Activity" description="Your recent portal activity." />
      <SectionCard title="Activity" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Activity arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
