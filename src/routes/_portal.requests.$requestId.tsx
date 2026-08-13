import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/requests/$requestId")({
  component: Page,
});

function Page() {
  const { requestId } = Route.useParams();
  return (
    <>
      <PageHeader title="Request {requestId}" description="Detailed record view." />
      <SectionCard title="Request details" subtitle={requestId}>
        <p className="py-8 text-center text-sm text-muted-foreground">Details for request {requestId} arrive in the next build step.</p>
      </SectionCard>
    </>
  );
}
