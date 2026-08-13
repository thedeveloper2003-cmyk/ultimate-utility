import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/settings")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Settings" description="Preferences and security." />
      <SectionCard title="Settings" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Settings arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
