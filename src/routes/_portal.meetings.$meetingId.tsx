import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/meetings/$meetingId")({
  component: Page,
});

function Page() {
  const { meetingId } = Route.useParams();
  return (
    <>
      <PageHeader title="Meeting {meetingId}" description="Detailed record view." />
      <SectionCard title="Meeting details" subtitle={meetingId}>
        <p className="py-8 text-center text-sm text-muted-foreground">Details for meeting {meetingId} arrive in the next build step.</p>
      </SectionCard>
    </>
  );
}
