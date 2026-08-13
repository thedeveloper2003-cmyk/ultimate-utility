import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/documents/$documentId")({
  component: Page,
});

function Page() {
  const { documentId } = Route.useParams();
  return (
    <>
      <PageHeader title="Document {documentId}" description="Detailed record view." />
      <SectionCard title="Document details" subtitle={documentId}>
        <p className="py-8 text-center text-sm text-muted-foreground">Details for document {documentId} arrive in the next build step.</p>
      </SectionCard>
    </>
  );
}
