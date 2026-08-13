import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/projects/")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Projects" description="Projects you contribute to." />
      <SectionCard title="Projects" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Projects arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
