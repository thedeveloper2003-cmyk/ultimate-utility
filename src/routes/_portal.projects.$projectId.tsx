import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/projects/$projectId")({
  component: Page,
});

function Page() {
  const { projectId } = Route.useParams();
  return (
    <>
      <PageHeader title="Project {projectId}" description="Detailed record view." />
      <SectionCard title="Project details" subtitle={projectId}>
        <p className="py-8 text-center text-sm text-muted-foreground">Details for project {projectId} arrive in the next build step.</p>
      </SectionCard>
    </>
  );
}
