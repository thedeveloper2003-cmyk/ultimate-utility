import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/documents/")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Documents" description="Your files and shared documents." />
      <SectionCard title="Documents" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Documents arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
