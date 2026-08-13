import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Clock, LogIn } from "lucide-react";
import { hydratePortal, login, usePortal } from "@/lib/portal/store";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Nexora Employee Portal" },
      { name: "description", content: "Secure sign-in to the Nexora employee portal for attendance, tasks, meetings and workplace services." },
      { property: "og:title", content: "Sign in — Nexora Employee Portal" },
      { property: "og:description", content: "Secure sign-in to the Nexora employee portal for attendance, tasks, meetings and workplace services." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const session = usePortal((s) => s.session);
  const [identifier, setIdentifier] = useState("arun.prakash@nexora.com");
  const [password, setPassword] = useState("Portal@123");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    hydratePortal();
  }, []);

  useEffect(() => {
    if (session?.active) void navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    const result = login(identifier, password);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    toast.success("Signed in. Attendance check-in recorded.");
    void navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">N</span>
          <span className="text-sm font-semibold">Nexora Workspace</span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl leading-tight font-semibold">One workspace for your entire working day.</h2>
          <p className="text-sm text-sidebar-foreground/70">
            Signing in records your exact attendance check-in and schedules a 9-hour working day with a live completion tracker.
          </p>
          <ul className="space-y-2 text-sm text-sidebar-foreground/80">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4" aria-hidden /> Automatic attendance and daily timeline</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" aria-hidden /> Role-based access to enterprise modules</li>
          </ul>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} Nexora Technologies</p>
      </section>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="page-title">Employee sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your work email, employee ID or employee code.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Work email / Employee ID</Label>
              <Input id="identifier" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Sign-in failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              <LogIn className="mr-2 h-4 w-4" aria-hidden />
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Demo credentials: <span className="font-medium text-foreground">arun.prakash@nexora.com</span> / <span className="font-medium text-foreground">Portal@123</span>
          </p>
        </div>
      </main>
    </div>
  );
}
