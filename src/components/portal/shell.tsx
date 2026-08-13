import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bell, Grid3x3, LayoutDashboard, CalendarDays, ListChecks, StickyNote, FolderKanban,
  Users, Building2, FileText, Megaphone, Inbox, CheckSquare, BookOpen, AlarmClock,
  History, Award, LifeBuoy, Settings as SettingsIcon, LogOut, Search, Menu, Clock,
  CalendarClock, UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeAvatar, StatusBadge } from "./primitives";
import {
  currentEmployee, fmtTime, globalSearch, logout, readAllNotifications, readNotification,
  setAvailability, todaysAttendance, usePortal, workProgress, fmtDuration,
} from "@/lib/portal/store";
import type { Availability } from "@/lib/portal/types";
import { toast } from "sonner";

const NAV = [
  { group: "Workspace", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/timeline", label: "Daily Timeline", icon: CalendarClock },
    { to: "/attendance", label: "Attendance", icon: Clock },
    { to: "/tasks", label: "My Tasks", icon: ListChecks },
    { to: "/notes", label: "My Notes", icon: StickyNote },
    { to: "/reminders", label: "Reminders", icon: AlarmClock },
  ]},
  { group: "Collaboration", items: [
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/meetings", label: "Meetings", icon: Users },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/team", label: "My Team", icon: Users },
    { to: "/organization", label: "Directory", icon: Building2 },
    { to: "/recognition", label: "Recognition", icon: Award },
  ]},
  { group: "Information", items: [
    { to: "/announcements", label: "Announcements", icon: Megaphone },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/documents", label: "Documents", icon: FileText },
    { to: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  ]},
  { group: "Services", items: [
    { to: "/requests", label: "My Requests", icon: Inbox },
    { to: "/approvals", label: "Approvals", icon: CheckSquare },
    { to: "/activity", label: "Activity", icon: History },
    { to: "/help", label: "Help & Support", icon: LifeBuoy },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ]},
];

const AVAILABILITY: Availability[] = ["Available", "Busy", "In Meeting", "Do Not Disturb", "Away", "Offline"];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="Primary" className="flex h-full flex-col gap-5 px-3 py-4">
      <Link to="/dashboard" className="flex items-center gap-2 px-2" onClick={onNavigate}>
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">N</span>
        <span className="text-sm font-semibold text-sidebar-foreground">Nexora Workspace</span>
      </Link>
      <ScrollArea className="flex-1">
        <div className="space-y-5 pr-2">
          {NAV.map((section) => (
            <div key={section.group}>
              <p className="px-2 pb-1 text-[10px] font-semibold tracking-[0.12em] text-sidebar-foreground/50 uppercase">{section.group}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </nav>
  );
}

function LiveClock({ checkIn }: { checkIn: string | null }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const p = workProgress(checkIn, now);
  if (!checkIn) return <span className="text-xs text-muted-foreground">Not checked in</span>;
  return (
    <div className="hidden text-right leading-tight sm:block">
      <p className="tabular text-xs font-semibold text-foreground">{fmtDuration(p.workedMinutes)} worked</p>
      <p className="tabular text-[11px] text-muted-foreground">Ends {fmtTime(p.expected)}</p>
    </div>
  );
}

export function PortalShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const state = usePortal((s) => s);
  const employee = currentEmployee(state);
  const attendance = todaysAttendance(state);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  const unread = state.notifications.filter((n) => !n.readAt);
  const results = useMemo(() => globalSearch(state, query), [state, query]);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    results.forEach((r) => map.set(r.group, [...(map.get(r.group) ?? []), r]));
    return [...map.entries()];
  }, [results]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!employee) return null;

  const go = (url: string) => {
    setSearchOpen(false);
    void navigate({ to: url });
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out. Attendance finalised for today.");
    void navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-sidebar lg:block">
        <SidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="surface-glass sticky top-0 z-30 flex h-14 items-center gap-2 rounded-none border-x-0 border-t-0 px-3 sm:px-4">
          <Sheet open={mobileNav} onOpenChange={setMobileNav}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarNav onNavigate={() => setMobileNav(false)} />
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            className="h-9 max-w-sm flex-1 justify-start gap-2 text-muted-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="truncate text-xs">Search people, tasks, projects…</span>
            <kbd className="ml-auto hidden rounded border border-border px-1 text-[10px] sm:inline">Ctrl K</kbd>
          </Button>

          <div className="ml-auto flex items-center gap-1.5">
            <LiveClock checkIn={attendance?.checkInTime ?? null} />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread.length} unread)`}>
                  <Bell className="h-5 w-5" />
                  {unread.length > 0 ? (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                      {unread.length}
                    </span>
                  ) : null}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <p className="text-sm font-semibold">Notifications</p>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => readAllNotifications()}>Mark all read</Button>
                </div>
                <ScrollArea className="max-h-80">
                  {state.notifications.slice(0, 8).map((n) => (
                    <button
                      key={n.notificationId}
                      onClick={() => { readNotification(n.notificationId); go(n.actionUrl); }}
                      className={cn("block w-full border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-accent/50", !n.readAt && "bg-primary/5")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-medium">{n.title}</p>
                        <StatusBadge value={n.priority} />
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                    </button>
                  ))}
                  {state.notifications.length === 0 ? <p className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications.</p> : null}
                </ScrollArea>
                <div className="border-t border-border p-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => go("/notifications")}>View all notifications</Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Apps launcher"><Grid3x3 className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Workspace apps</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[["Tasks", "/tasks"], ["Calendar", "/calendar"], ["Documents", "/documents"], ["Requests", "/requests"], ["Knowledge", "/knowledge"], ["Help", "/help"]].map(([label, url]) => (
                  <DropdownMenuItem key={url} onSelect={() => go(url as string)}>{label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Account menu">
                  <EmployeeAvatar name={employee.displayName} size="sm" availability={employee.availability} />
                  <span className="hidden text-left leading-tight md:block">
                    <span className="block text-xs font-semibold">{employee.displayName}</span>
                    <span className="block text-[11px] text-muted-foreground">{employee.employeeCode} · {employee.department}</span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="space-y-0.5">
                  <p className="text-sm">{employee.displayName}</p>
                  <p className="text-xs font-normal text-muted-foreground">{employee.jobTitle}</p>
                  <p className="text-xs font-normal text-muted-foreground">{employee.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] tracking-wide uppercase">Availability</DropdownMenuLabel>
                {AVAILABILITY.map((a) => (
                  <DropdownMenuItem key={a} onSelect={() => { setAvailability(a); toast.success(`Availability set to ${a}.`); }}>
                    <span className={cn("mr-2 h-2 w-2 rounded-full", a === employee.availability ? "bg-primary" : "bg-border")} />
                    {a}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => go("/profile")}><UserRound className="mr-2 h-4 w-4" />My profile</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => go("/settings")}><SettingsIcon className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Sign out"><LogOut className="h-5 w-5" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of the employee portal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your actual logout time will be recorded and today's attendance will be finalised. Historical attendance is preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay signed in</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Sign out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6">{children}</main>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search employees, tasks, projects, documents…" value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>{query.length < 2 ? "Type at least two characters to search." : "Nothing matched your search."}</CommandEmpty>
          {grouped.map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((r) => (
                <CommandItem key={r.group + r.id} value={`${r.group} ${r.title} ${r.id}`} onSelect={() => go(r.url)}>
                  <span className="truncate">{r.title}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">{r.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
