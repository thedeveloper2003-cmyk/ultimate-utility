import { addMinutes, differenceInMinutes, format, isAfter, parseISO } from "date-fns";
import { useSyncExternalStore } from "react";
import { buildSeedState, CURRENT_EMPLOYEE_ID, ROLE_PERMISSIONS, WORK_HOURS, dateKey } from "./seed";
import type {
  ActivityEntry, AppNotification, Availability, Employee, EmployeeRequest, Note,
  Permission, PortalState, Priority, Reminder, Settings, Task, TaskStatus, WorkStatus,
} from "./types";

const STORAGE_KEY = "nexora-employee-portal-v1";

let state: PortalState = buildSeedState(new Date());
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — runtime state stays in memory */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (draft: PortalState) => PortalState) {
  state = updater(state);
  persist();
  emit();
}

export function hydratePortal() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PortalState;
      if (parsed.seedDate === dateKey(new Date())) {
        state = parsed;
        emit();
        return;
      }
      // Re-seed relative to the new current date, keep the live session.
      const fresh = buildSeedState(new Date());
      state = { ...fresh, session: parsed.session, settings: parsed.settings };
    }
  } catch {
    /* corrupted storage — fall back to a fresh seed */
  }
  persist();
  emit();
}

export function resetPortal() {
  state = buildSeedState(new Date());
  persist();
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function usePortal<T>(selector: (s: PortalState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot()),
  );
}

export const getState = () => state;

/* ---------------- helpers ---------------- */

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const fmtTime = (v: string | null | undefined) => (v ? format(parseISO(v), "hh:mm a") : "—");
export const fmtDate = (v: string | null | undefined) => (v ? format(parseISO(v), "dd MMM yyyy") : "—");
export const fmtDateTime = (v: string | null | undefined) => (v ? format(parseISO(v), "dd MMM yyyy, hh:mm a") : "—");
export const fmtDuration = (mins: number) => `${Math.max(0, Math.floor(mins / 60))}h ${Math.max(0, mins % 60)}m`;

export function currentEmployee(s: PortalState): Employee | null {
  if (!s.session) return null;
  return s.employees.find((e) => e.employeeId === s.session!.employeeId) ?? null;
}

export function permissionsOf(s: PortalState): Permission[] {
  const emp = currentEmployee(s);
  return emp ? ROLE_PERMISSIONS[emp.role] : [];
}

export function hasPermission(s: PortalState, p: Permission) {
  return permissionsOf(s).includes(p);
}

function pushActivity(s: PortalState, action: string, detail: string, entityType: string, entityId: string): PortalState {
  const entry: ActivityEntry = {
    activityId: uid("ACT"), employeeId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID,
    action, detail, entityType, entityId, timestamp: new Date().toISOString(),
  };
  return { ...s, activity: [entry, ...s.activity] };
}

function pushAudit(s: PortalState, action: string, entityType: string, entityId: string, oldValue: string, newValue: string): PortalState {
  return {
    ...s,
    audit: [{
      auditId: uid("AUD"), employeeId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID,
      action, entityType, entityId, oldValue, newValue,
      timestamp: new Date().toISOString(), sessionId: s.session?.sessionId ?? "no-session",
    }, ...s.audit],
  };
}

function pushNotification(s: PortalState, n: Omit<AppNotification, "notificationId" | "employeeId" | "createdAt" | "readAt">): PortalState {
  return {
    ...s,
    notifications: [{
      ...n, notificationId: uid("NTF"), employeeId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID,
      createdAt: new Date().toISOString(), readAt: null,
    }, ...s.notifications],
  };
}

/* ---------------- auth & attendance ---------------- */

export type LoginResult = { ok: true } | { ok: false; message: string };

export function login(identifier: string, password: string): LoginResult {
  const id = identifier.trim().toLowerCase();
  const emp = state.employees.find(
    (e) => e.email.toLowerCase() === id || e.employeeId.toLowerCase() === id || e.employeeCode.toLowerCase() === id,
  );
  if (!emp) return { ok: false, message: "We couldn't find an employee with those sign-in details." };
  if (emp.password !== password) return { ok: false, message: "Incorrect password. Please try again." };

  switch (emp.accountStatus) {
    case "Locked":
      return { ok: false, message: "This account is locked after repeated failed sign-ins. Contact the IT service desk." };
    case "Suspended":
      return { ok: false, message: "This account is suspended. Contact your manager or Corporate IT." };
    case "Pending Activation":
      return { ok: false, message: "This account is pending activation. Complete activation from your welcome email." };
    case "Inactive":
      return { ok: false, message: "This account is inactive and cannot access the portal." };
    case "Deactivated":
      return { ok: false, message: "This account has been deactivated." };
    default:
      break;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const key = dateKey(now);
  const expected = addMinutes(now, WORK_HOURS * 60).toISOString();

  setState((s) => {
    let next: PortalState = {
      ...s,
      session: { sessionId: uid("SES"), employeeId: emp.employeeId, loginTime: nowIso, active: true },
      employees: s.employees.map((e) => (e.employeeId === emp.employeeId ? { ...e, availability: "Available" as Availability } : e)),
    };

    const existing = next.attendance.find((a) => a.date === key && a.employeeId === emp.employeeId);
    if (existing) {
      next = {
        ...next,
        attendance: next.attendance.map((a) =>
          a === existing
            ? { ...a, checkInTime: a.checkInTime ?? nowIso, expectedCompletionTime: a.expectedCompletionTime ?? expected, actualLogoutTime: null, status: "Present", workStatus: "Working" }
            : a),
      };
    } else {
      next = {
        ...next,
        attendance: [...next.attendance, {
          attendanceId: `ATT-${key}`, employeeId: emp.employeeId, date: key,
          checkInTime: nowIso, expectedCompletionTime: expected, actualLogoutTime: null,
          workDurationMinutes: 0, breakDurationMinutes: 0, status: "Present", workStatus: "Working",
        }],
      };
    }

    const loginBlockId = `TLB-${key}-login`;
    next = {
      ...next,
      timeline: [
        ...next.timeline.filter((b) => b.id !== loginBlockId),
        {
          id: loginBlockId, employeeId: emp.employeeId, date: key, type: "LOGIN",
          title: "Signed in to Employee Portal", description: "Attendance check-in recorded from portal sign-in.",
          startTime: nowIso, endTime: nowIso, status: "Completed", priority: "Low",
        },
      ],
    };

    next = pushActivity(next, "Login", `Signed in and checked in at ${format(now, "hh:mm a")}.`, "attendance", `ATT-${key}`);
    next = pushAudit(next, "LOGIN", "session", next.session!.sessionId, "signed-out", "signed-in");
    return next;
  });

  return { ok: true };
}

export function logout() {
  const now = new Date();
  const key = dateKey(now);
  setState((s) => {
    if (!s.session) return s;
    const emp = s.session.employeeId;
    let next: PortalState = {
      ...s,
      attendance: s.attendance.map((a) => {
        if (a.date !== key || a.employeeId !== emp) return a;
        const worked = a.checkInTime ? differenceInMinutes(now, parseISO(a.checkInTime)) : 0;
        return { ...a, actualLogoutTime: now.toISOString(), workDurationMinutes: worked, workStatus: "Work Completed" as WorkStatus };
      }),
      employees: s.employees.map((e) => (e.employeeId === emp ? { ...e, availability: "Offline" as Availability } : e)),
    };
    next = pushActivity(next, "Logout", `Signed out at ${format(now, "hh:mm a")}. Attendance finalised.`, "attendance", `ATT-${key}`);
    next = pushAudit(next, "LOGOUT", "session", s.session.sessionId, "signed-in", "signed-out");
    return { ...next, session: null };
  });
}

export function todaysAttendance(s: PortalState) {
  const key = dateKey(new Date());
  return s.attendance.find((a) => a.date === key && a.employeeId === (s.session?.employeeId ?? CURRENT_EMPLOYEE_ID)) ?? null;
}

export function attendanceFor(s: PortalState, key: string) {
  return s.attendance.find((a) => a.date === key && a.employeeId === (s.session?.employeeId ?? CURRENT_EMPLOYEE_ID)) ?? null;
}

export function workProgress(checkIn: string | null, now: Date) {
  if (!checkIn) return { workedMinutes: 0, remainingMinutes: WORK_HOURS * 60, percent: 0, expected: null as string | null };
  const start = parseISO(checkIn);
  const workedMinutes = Math.max(0, differenceInMinutes(now, start));
  const total = WORK_HOURS * 60;
  const expected = addMinutes(start, total).toISOString();
  return {
    workedMinutes,
    remainingMinutes: Math.max(0, total - workedMinutes),
    percent: Math.min(100, Math.round((workedMinutes / total) * 100)),
    expected,
  };
}

/* ---------------- tasks ---------------- */

export function updateTask(taskId: string, patch: Partial<Task>, activityLabel?: string) {
  setState((s) => {
    const before = s.tasks.find((t) => t.taskId === taskId);
    if (!before) return s;
    const after: Task = { ...before, ...patch, updatedAt: new Date().toISOString() };
    let next: PortalState = { ...s, tasks: s.tasks.map((t) => (t.taskId === taskId ? after : t)) };
    next = {
      ...next,
      timeline: next.timeline.map((b) =>
        b.taskId === taskId
          ? { ...b, status: after.status === "Completed" ? "Completed" : after.status === "In Progress" ? "Active" : b.status }
          : b),
    };
    next = pushActivity(next, activityLabel ?? "Task updated", `${after.title} → ${after.status} (${after.progress}%).`, "task", taskId);
    next = pushAudit(next, "TASK_UPDATE", "task", taskId, before.status, after.status);
    if (patch.status === "Completed" || patch.status === "Blocked") {
      next = pushNotification(next, {
        type: "task",
        title: patch.status === "Completed" ? "Task completed" : "Blocker reported",
        message: `${after.title} is now ${after.status}.`,
        priority: patch.status === "Blocked" ? "High" : "Low",
        entityType: "task", entityId: taskId, actionUrl: `/tasks/${taskId}`,
      });
    }
    return next;
  });
}

export function setTaskStatus(taskId: string, status: TaskStatus) {
  const t = state.tasks.find((x) => x.taskId === taskId);
  const progress = status === "Completed" ? 100 : status === "In Progress" && (t?.progress ?? 0) === 0 ? 10 : t?.progress ?? 0;
  updateTask(taskId, { status, progress }, `Task ${status.toLowerCase()}`);
}

export function addTaskComment(taskId: string, message: string) {
  setState((s) => {
    const next = {
      ...s,
      tasks: s.tasks.map((t) =>
        t.taskId === taskId
          ? { ...t, comments: [...t.comments, { commentId: uid("CMT"), authorId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID, message, createdAt: new Date().toISOString() }] }
          : t),
    };
    return pushActivity(next, "Comment added", `Comment added on task ${taskId}.`, "task", taskId);
  });
}

export function createTask(input: { title: string; description: string; projectId: string; dueDate: string; priority: Priority; estimatedHours: number }) {
  const now = new Date().toISOString();
  const id = uid("TSK");
  setState((s) => {
    const employeeId = s.session?.employeeId ?? CURRENT_EMPLOYEE_ID;
    const task: Task = {
      taskId: id, employeeId, title: input.title, description: input.description,
      projectId: input.projectId, assignedBy: employeeId, assignedDate: dateKey(new Date()),
      startDate: dateKey(new Date()), dueDate: input.dueDate, priority: input.priority,
      status: "Assigned", progress: 0, estimatedHours: input.estimatedHours, actualHours: 0,
      tags: ["self-created"], comments: [], createdAt: now, updatedAt: now,
    };
    let next: PortalState = {
      ...s,
      tasks: [task, ...s.tasks],
      timeline: [...s.timeline, {
        id: `TLB-${id}`, employeeId, date: task.startDate, type: "TASK",
        title: task.title, description: task.description,
        startTime: new Date().toISOString(), endTime: addMinutes(new Date(), input.estimatedHours * 60).toISOString(),
        status: "Planned", priority: task.priority, taskId: id, projectId: task.projectId,
      }],
    };
    next = pushActivity(next, "Task created", `Created task “${task.title}”.`, "task", id);
    next = pushAudit(next, "TASK_CREATE", "task", id, "—", task.title);
    return next;
  });
  return id;
}

/* ---------------- notes ---------------- */

export function saveNote(note: Partial<Note> & { title: string; content: string; category: string; noteId?: string }) {
  setState((s) => {
    const now = new Date().toISOString();
    if (note.noteId) {
      const next = { ...s, notes: s.notes.map((n) => (n.noteId === note.noteId ? { ...n, ...note, updatedAt: now } as Note : n)) };
      return pushActivity(next, "Note updated", `Updated note “${note.title}”.`, "note", note.noteId);
    }
    const created: Note = {
      noteId: uid("NOT"), employeeId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID,
      title: note.title, content: note.content, category: note.category,
      pinned: false, archived: false, createdAt: now, updatedAt: now,
    };
    const next = { ...s, notes: [created, ...s.notes] };
    return pushActivity(next, "Note created", `Created note “${created.title}”.`, "note", created.noteId);
  });
}

export function toggleNote(noteId: string, field: "pinned" | "archived") {
  setState((s) => ({ ...s, notes: s.notes.map((n) => (n.noteId === noteId ? { ...n, [field]: !n[field] } : n)) }));
}

export function deleteNote(noteId: string) {
  setState((s) => pushActivity({ ...s, notes: s.notes.filter((n) => n.noteId !== noteId) }, "Note deleted", `Deleted note ${noteId}.`, "note", noteId));
}

/* ---------------- reminders ---------------- */

export function createReminder(input: { title: string; description: string; date: string; time: string; priority: Priority }) {
  setState((s) => {
    const reminder: Reminder = {
      reminderId: uid("RMD"), employeeId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID,
      ...input, status: "Pending", createdAt: new Date().toISOString(),
    };
    let next: PortalState = { ...s, reminders: [reminder, ...s.reminders] };
    next = pushNotification(next, {
      type: "reminder", title: "Reminder scheduled",
      message: `${reminder.title} — ${reminder.date} at ${reminder.time}.`,
      priority: reminder.priority, entityType: "reminder", entityId: reminder.reminderId, actionUrl: "/reminders",
    });
    return pushActivity(next, "Reminder created", `Created reminder “${reminder.title}”.`, "reminder", reminder.reminderId);
  });
}

export function setReminderStatus(reminderId: string, status: Reminder["status"]) {
  setState((s) => ({ ...s, reminders: s.reminders.map((r) => (r.reminderId === reminderId ? { ...r, status } : r)) }));
}

/* ---------------- notifications & announcements ---------------- */

export function readNotification(notificationId: string) {
  setState((s) => ({
    ...s,
    notifications: s.notifications.map((n) => (n.notificationId === notificationId ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)),
  }));
}

export function readAllNotifications() {
  const now = new Date().toISOString();
  setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, readAt: n.readAt ?? now })) }));
}

export function readAnnouncement(announcementId: string) {
  setState((s) => {
    const me = s.session?.employeeId ?? CURRENT_EMPLOYEE_ID;
    return {
      ...s,
      announcements: s.announcements.map((a) =>
        a.announcementId === announcementId && !a.readBy.includes(me) ? { ...a, readBy: [...a.readBy, me] } : a),
    };
  });
}

/* ---------------- requests & approvals ---------------- */

export function createRequest(input: { category: EmployeeRequest["category"]; title: string; description: string; priority: Priority }) {
  const id = uid("REQ");
  setState((s) => {
    const now = new Date().toISOString();
    const req: EmployeeRequest = {
      requestId: id, employeeId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID, ...input,
      status: "Submitted", createdAt: now, updatedAt: now,
      history: [{ at: now, status: "Submitted", note: "Request submitted through the employee portal." }],
      comments: [],
    };
    let next: PortalState = { ...s, requests: [req, ...s.requests] };
    next = pushNotification(next, {
      type: "system", title: "Request submitted", message: `${req.title} was submitted to ${req.category}.`,
      priority: req.priority, entityType: "request", entityId: id, actionUrl: `/requests/${id}`,
    });
    next = pushActivity(next, "Request created", `Raised ${req.category} request “${req.title}”.`, "request", id);
    return pushAudit(next, "REQUEST_CREATE", "request", id, "—", "Submitted");
  });
  return id;
}

export function advanceRequest(requestId: string, status: EmployeeRequest["status"], note: string) {
  setState((s) => {
    const now = new Date().toISOString();
    const before = s.requests.find((r) => r.requestId === requestId);
    if (!before) return s;
    const next: PortalState = {
      ...s,
      requests: s.requests.map((r) => r.requestId === requestId
        ? { ...r, status, updatedAt: now, history: [...r.history, { at: now, status, note }] }
        : r),
    };
    return pushAudit(pushActivity(next, "Request updated", `${before.title} → ${status}.`, "request", requestId), "REQUEST_UPDATE", "request", requestId, before.status, status);
  });
}

export function addRequestComment(requestId: string, message: string) {
  setState((s) => ({
    ...s,
    requests: s.requests.map((r) => r.requestId === requestId
      ? { ...r, comments: [...r.comments, { authorId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID, message, createdAt: new Date().toISOString() }] }
      : r),
  }));
}

export function decideApproval(approvalId: string, decision: "Approved" | "Rejected" | "Changes Requested") {
  setState((s) => {
    const before = s.approvals.find((a) => a.approvalId === approvalId);
    if (!before) return s;
    const next: PortalState = {
      ...s,
      approvals: s.approvals.map((a) => (a.approvalId === approvalId ? { ...a, status: decision, decidedAt: new Date().toISOString() } : a)),
    };
    return pushAudit(pushActivity(next, "Approval completed", `${before.title} → ${decision}.`, "approval", approvalId), "APPROVAL_DECISION", "approval", approvalId, before.status, decision);
  });
}

/* ---------------- documents ---------------- */

export function uploadDocument(input: { name: string; category: import("./types").DocumentItem["category"]; fileType: string }) {
  setState((s) => {
    const now = new Date().toISOString();
    const doc = {
      documentId: uid("DOC"), name: input.name, category: input.category,
      ownerId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID, fileType: input.fileType,
      sizeKb: 120 + Math.floor(Math.random() * 900), version: "v1.0", updatedAt: now,
      archived: false, versions: [{ version: "v1.0", updatedAt: now, note: "Initial upload from the employee portal." }],
    };
    const next = { ...s, documents: [doc, ...s.documents] };
    return pushActivity(next, "Document uploaded", `Uploaded “${doc.name}”.`, "document", doc.documentId);
  });
}

export function renameDocument(documentId: string, name: string) {
  setState((s) => ({ ...s, documents: s.documents.map((d) => (d.documentId === documentId ? { ...d, name, updatedAt: new Date().toISOString() } : d)) }));
}

export function archiveDocument(documentId: string) {
  setState((s) => ({ ...s, documents: s.documents.map((d) => (d.documentId === documentId ? { ...d, archived: !d.archived } : d)) }));
}

/* ---------------- status, recognition, settings ---------------- */

export function setAvailability(availability: Availability) {
  setState((s) => {
    if (!s.session) return s;
    const next = {
      ...s,
      employees: s.employees.map((e) => (e.employeeId === s.session!.employeeId ? { ...e, availability } : e)),
    };
    return pushActivity(next, "Status changed", `Availability set to ${availability}.`, "employee", s.session.employeeId);
  });
}

export function setWorkStatus(workStatus: WorkStatus) {
  const key = dateKey(new Date());
  setState((s) => {
    const next = { ...s, attendance: s.attendance.map((a) => (a.date === key ? { ...a, workStatus } : a)) };
    return pushActivity(next, "Work status changed", `Work status set to ${workStatus}.`, "attendance", `ATT-${key}`);
  });
}

export function sendRecognition(toId: string, badge: string, message: string) {
  setState((s) => {
    const next = {
      ...s,
      recognition: [{
        recognitionId: uid("REC"), fromId: s.session?.employeeId ?? CURRENT_EMPLOYEE_ID,
        toId, badge, message, createdAt: new Date().toISOString(),
      }, ...s.recognition],
    };
    return pushActivity(next, "Recognition sent", `Recognised a colleague with the ${badge} badge.`, "recognition", toId);
  });
}

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function signOutOtherSessions() {
  setState((s) => ({ ...s, settings: { ...s.settings, sessions: s.settings.sessions.filter((x) => x.current) } }));
}

/* ---------------- derived selectors ---------------- */

export function activeMeetingNow(s: PortalState, now: Date) {
  return s.meetings.find((m) => m.date === dateKey(now) && isAfter(now, parseISO(m.startTime)) && isAfter(parseISO(m.endTime), now)) ?? null;
}

export function globalSearch(s: PortalState, query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [] as { group: string; id: string; title: string; subtitle: string; url: string }[];
  const out: { group: string; id: string; title: string; subtitle: string; url: string }[] = [];
  const add = (group: string, id: string, title: string, subtitle: string, url: string) => out.push({ group, id, title, subtitle, url });
  s.tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5).forEach((t) => add("Tasks", t.taskId, t.title, `${t.status} · due ${t.dueDate}`, `/tasks/${t.taskId}`));
  s.projects.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5).forEach((p) => add("Projects", p.projectId, p.name, p.status, `/projects/${p.projectId}`));
  s.employees.filter((e) => e.displayName.toLowerCase().includes(q) || e.jobTitle.toLowerCase().includes(q)).slice(0, 5).forEach((e) => add("People", e.employeeId, e.displayName, e.jobTitle, `/organization`));
  s.documents.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 5).forEach((d) => add("Documents", d.documentId, d.name, d.category, `/documents/${d.documentId}`));
  s.meetings.filter((m) => m.title.toLowerCase().includes(q)).slice(0, 5).forEach((m) => add("Meetings", m.meetingId, m.title, m.date, `/meetings/${m.meetingId}`));
  s.announcements.filter((a) => a.title.toLowerCase().includes(q)).slice(0, 3).forEach((a) => add("Announcements", a.announcementId, a.title, a.category, `/announcements`));
  s.knowledge.filter((k) => k.title.toLowerCase().includes(q) || k.summary.toLowerCase().includes(q)).slice(0, 5).forEach((k) => add("Knowledge", k.articleId, k.title, k.category, `/knowledge`));
  s.requests.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 3).forEach((r) => add("Requests", r.requestId, r.title, r.status, `/requests/${r.requestId}`));
  s.notes.filter((n) => n.title.toLowerCase().includes(q)).slice(0, 3).forEach((n) => add("Notes", n.noteId, n.title, n.category, `/notes`));
  return out;
}

export { CURRENT_EMPLOYEE_ID, WORK_HOURS, dateKey, ROLE_PERMISSIONS };

/* ---------------- attendance markers ---------------- */

/**
 * Real recorded day markers (check-in, lunch, logout) taken from the
 * attendance record for `key`, with the timeline break block used for the
 * lunch window. Falls back to the live session / expected completion time
 * when a value has not been recorded yet.
 */
export function attendanceMarkers(s: PortalState, key: string) {
  const employeeId = s.session?.employeeId ?? CURRENT_EMPLOYEE_ID;
  const att = attendanceFor(s, key);
  const isToday = key === dateKey(new Date());

  const breaks = s.timeline
    .filter((b) => b.date === key && b.employeeId === employeeId && b.type === "BREAK")
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const lunch = breaks[0] ?? null;

  const checkIn = att?.checkInTime ?? (isToday ? s.session?.loginTime ?? null : null);
  const logout = att?.actualLogoutTime ?? null;
  const expected =
    att?.expectedCompletionTime ??
    (checkIn ? addMinutes(parseISO(checkIn), WORK_HOURS * 60).toISOString() : null);

  const recordedBreak = att?.breakDurationMinutes ?? 0;
  const breakMinutes = recordedBreak > 0
    ? recordedBreak
    : lunch ? Math.max(0, differenceInMinutes(parseISO(lunch.endTime), parseISO(lunch.startTime))) : 0;

  const workedMinutes = att?.workDurationMinutes && att.workDurationMinutes > 0
    ? att.workDurationMinutes
    : checkIn ? workProgress(checkIn, logout ? parseISO(logout) : new Date()).workedMinutes : 0;

  return {
    attendance: att,
    checkIn,
    lunchStart: lunch?.startTime ?? null,
    lunchEnd: lunch?.endTime ?? null,
    breakMinutes,
    logout,
    expected,
    projected: !logout,
    workedMinutes,
    status: att?.status ?? null,
    workStatus: att?.workStatus ?? null,
  };
}

export type AttendanceMarkers = ReturnType<typeof attendanceMarkers>;
