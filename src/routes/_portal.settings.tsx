import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge } from "@/components/portal/primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { currentEmployee, fmtDateTime, setAvailability, signOutOtherSessions, updateSettings, usePortal } from "@/lib/portal/store";
import type { Availability, Settings } from "@/lib/portal/types";

export const Route = createFileRoute("/_portal/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Protechsoft Employee Portal" },
      { name: "description", content: "Manage theme, language, timezone, notification preferences, presence privacy and active sessions." },
      { property: "og:title", content: "Settings — Protechsoft Employee Portal" },
      { property: "og:description", content: "Theme, notifications, privacy and session controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const AVAILABILITY: Availability[] = ["Available", "Busy", "In Meeting", "Do Not Disturb", "Away", "Offline"];
const LANGUAGES = ["English (UK)", "English (US)", "Deutsch", "Français", "हिन्दी"];
const TIMEZONES = ["Europe/London", "Europe/Berlin", "Asia/Kolkata", "America/New_York", "Asia/Singapore"];

const NOTIFY: { key: keyof Settings; label: string; hint: string }[] = [
  { key: "notifyTasks", label: "Task updates", hint: "Assignments, status changes and comments" },
  { key: "notifyMeetings", label: "Meeting reminders", hint: "Invites, changes and 10-minute nudges" },
  { key: "notifyAnnouncements", label: "Announcements", hint: "Company, HR and department news" },
  { key: "notifySystem", label: "System alerts", hint: "Security, maintenance and policy notices" },
];

function Page() {
  const state = usePortal((s) => s);
  const me = currentEmployee(state);
  const s = state.settings;

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = s.theme === "dark" || (s.theme === "system" && prefersDark);
    root.classList.toggle("dark", dark);
  }, [s.theme]);

  const patch = (p: Partial<Settings>, msg: string) => { updateSettings(p); toast.success(msg); };

  return (
    <>
      <PageHeader title="Settings" description="Personalise the portal, control notifications and manage your account security." />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Appearance & locale" subtitle="How the portal looks and formats data">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Theme</Label>
              <Select value={s.theme} onValueChange={(v) => patch({ theme: v as Settings["theme"] }, `Theme set to ${v}`)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">Match system</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={s.language} onValueChange={(v) => patch({ language: v }, "Language updated")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select value={s.timezone} onValueChange={(v) => patch({ timezone: v }, "Timezone updated")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label>Presence</Label>
              <Select value={me?.availability ?? "Available"} onValueChange={(v) => { setAvailability(v as Availability); toast.success(`Presence set to ${v}`); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AVAILABILITY.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Notifications" subtitle="Choose what reaches your inbox">
          <div className="space-y-3">
            {NOTIFY.map((n) => (
              <div key={String(n.key)} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-[11px] text-muted-foreground">{n.hint}</p>
                </div>
                <Switch
                  checked={Boolean(s[n.key])}
                  aria-label={n.label}
                  onCheckedChange={(v) => patch({ [n.key]: v } as Partial<Settings>, `${n.label} ${v ? "enabled" : "disabled"}`)}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Privacy & security" subtitle="Visibility and sign-in protection">
          <div className="space-y-3">
            {[
              { key: "presenceVisible" as const, label: "Show my presence", hint: "Colleagues can see if you are available" },
              { key: "directoryVisible" as const, label: "List me in the directory", hint: "Appear in employee directory search" },
              { key: "mfaEnabled" as const, label: "Two-factor authentication", hint: "Require a second factor at sign-in" },
            ].map((row) => (
              <div key={row.key} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    {row.key === "mfaEnabled" ? <ShieldCheck className="h-3.5 w-3.5 text-success" /> : null}{row.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{row.hint}</p>
                </div>
                <Switch checked={s[row.key]} aria-label={row.label} onCheckedChange={(v) => patch({ [row.key]: v }, `${row.label} ${v ? "enabled" : "disabled"}`)} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Active sessions"
          subtitle={`${s.sessions.length} devices signed in`}
          action={
            <Button variant="outline" size="sm" onClick={() => { signOutOtherSessions(); toast.success("Other sessions signed out"); }}>
              <LogOut className="mr-1.5 h-3.5 w-3.5" />Sign out others
            </Button>
          }
        >
          <ul className="space-y-2">
            {s.sessions.map((sess) => (
              <li key={sess.sessionId} className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium"><MonitorSmartphone className="h-3.5 w-3.5 text-primary" />{sess.device}</p>
                  <p className="tabular text-[11px] text-muted-foreground">Last active {fmtDateTime(sess.lastActive)}</p>
                </div>
                {sess.current ? <StatusBadge value="Active" /> : <StatusBadge value="Pending" />}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
