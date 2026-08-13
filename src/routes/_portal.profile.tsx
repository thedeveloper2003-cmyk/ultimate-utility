import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/profile")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="My Profile" description="Your employee record." />
      <SectionCard title="My Profile" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for My Profile arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
