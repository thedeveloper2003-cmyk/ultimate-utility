import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/reminders")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Reminders" description="Personal reminders and follow-ups." />
      <SectionCard title="Reminders" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Reminders arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
