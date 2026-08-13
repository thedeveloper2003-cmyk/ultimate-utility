import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/announcements")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Announcements" description="Company and department updates." />
      <SectionCard title="Announcements" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Announcements arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
