import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/shell";
import { hydratePortal, usePortal } from "@/lib/portal/store";

export const Route = createFileRoute("/_portal")({
  ssr: false,
  component: PortalLayout,
});

function PortalLayout() {
  const navigate = useNavigate();
  const session = usePortal((s) => s.session);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydratePortal();
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !session?.active) void navigate({ to: "/", replace: true });
  }, [ready, session, navigate]);

  if (!ready || !session?.active) return null;

  return (
    <PortalShell>
      <Outlet />
    </PortalShell>
  );
}
