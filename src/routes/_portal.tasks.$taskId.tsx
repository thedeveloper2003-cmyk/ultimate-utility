import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/portal/primitives";

export const Route = createFileRoute("/_portal/tasks/$taskId")({
  component: Page,
});

function Page() {
  const { taskId } = Route.useParams();
  return (
    <>
      <PageHeader title="Task {taskId}" description="Detailed record view." />
      <SectionCard title="Task details" subtitle={taskId}>
        <p className="py-8 text-center text-sm text-muted-foreground">Details for task {taskId} arrive in the next build step.</p>
      </SectionCard>
    </>
  );
}
