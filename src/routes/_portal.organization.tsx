import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/organization")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Directory" description="Company-wide employee directory." />
      <SectionCard title="Directory" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Directory arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
