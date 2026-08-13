import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/attendance")({
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Attendance" description="Check-in, working hours and history." />
      <SectionCard title="Attendance" subtitle="This module is being wired up next.">
        <p className="py-8 text-center text-sm text-muted-foreground">Content for Attendance arrives in the next build step.</p>
      </SectionCard>
    </>
  );
}
