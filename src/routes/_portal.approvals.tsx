import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/approvals")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Approvals" description="Items awaiting your decision." />
      <SectionCard title="Approvals" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Approvals arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
