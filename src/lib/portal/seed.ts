import { addDays, addMinutes, format, startOfDay } from "date-fns";
import type {
  Announcement, AppNotification, Approval, Attendance, DocumentItem, Employee,
  EmployeeRequest, KnowledgeArticle, Meeting, Note, PortalState, Project,
  Recognition, Reminder, Task, TimelineBlock, ActivityEntry, Permission, Role,
} from "./types";

export const WORK_HOURS = 9;

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Employee: ["TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_COMPLETE", "PROJECT_VIEW", "DOCUMENT_VIEW", "DOCUMENT_UPLOAD", "REQUEST_CREATE", "REQUEST_VIEW", "REQUEST_UPDATE", "ANNOUNCEMENT_VIEW", "DIRECTORY_VIEW"],
  "Team Lead": ["TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_ASSIGN", "TASK_COMPLETE", "PROJECT_VIEW", "PROJECT_UPDATE", "DOCUMENT_VIEW", "DOCUMENT_UPLOAD", "DOCUMENT_SHARE", "REQUEST_CREATE", "REQUEST_VIEW", "REQUEST_UPDATE", "ANNOUNCEMENT_VIEW", "APPROVAL_ACT", "DIRECTORY_VIEW"],
  Manager: ["TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_ASSIGN", "TASK_COMPLETE", "PROJECT_VIEW", "PROJECT_UPDATE", "DOCUMENT_VIEW", "DOCUMENT_UPLOAD", "DOCUMENT_SHARE", "REQUEST_CREATE", "REQUEST_VIEW", "REQUEST_UPDATE", "ANNOUNCEMENT_VIEW", "ANNOUNCEMENT_CREATE", "APPROVAL_ACT", "DIRECTORY_VIEW"],
  "Portal Administrator": ["TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_ASSIGN", "TASK_COMPLETE", "PROJECT_VIEW", "PROJECT_UPDATE", "DOCUMENT_VIEW", "DOCUMENT_UPLOAD", "DOCUMENT_SHARE", "REQUEST_CREATE", "REQUEST_VIEW", "REQUEST_UPDATE", "ANNOUNCEMENT_VIEW", "ANNOUNCEMENT_CREATE", "APPROVAL_ACT", "DIRECTORY_VIEW"],
  "System Administrator": ["TASK_VIEW", "TASK_CREATE", "TASK_UPDATE", "TASK_ASSIGN", "TASK_COMPLETE", "PROJECT_VIEW", "PROJECT_UPDATE", "DOCUMENT_VIEW", "DOCUMENT_UPLOAD", "DOCUMENT_SHARE", "REQUEST_CREATE", "REQUEST_VIEW", "REQUEST_UPDATE", "ANNOUNCEMENT_VIEW", "ANNOUNCEMENT_CREATE", "APPROVAL_ACT", "DIRECTORY_VIEW"],
};

export const dateKey = (d: Date | string) => format(typeof d === "string" ? new Date(d) : d, "yyyy-MM-dd");

let seedState = 20260812;
const rnd = () => {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296;
  return seedState / 4294967296;
};
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)] as T;
const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));

const iso = (day: Date, h: number, m = 0) => addMinutes(startOfDay(day), h * 60 + m).toISOString();

export const CURRENT_EMPLOYEE_ID = "EMP-1001";

const employees: Employee[] = [
  {
    employeeId: "EMP-1001", employeeCode: "NX-1001", firstName: "Arun", lastName: "Prakash",
    displayName: "Arun Prakash", email: "arun.prakash@protechsoft.com", password: "Portal@123", phone: "+91 98400 21134",
    jobTitle: "Senior Frontend Engineer", department: "Engineering", team: "Web Platform", managerId: "EMP-1004",
    location: "Chennai, IN", timezone: "Asia/Kolkata", workSchedule: "09:00 - 18:00 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Active", availability: "Available", role: "Employee",
    skills: ["Angular", "TypeScript", "React", "Design Systems", "Accessibility"], joinedOn: "2022-03-14",
  },
  {
    employeeId: "EMP-1002", employeeCode: "NX-1002", firstName: "Meera", lastName: "Raghavan",
    displayName: "Meera Raghavan", email: "meera.raghavan@protechsoft.com", password: "Portal@123", phone: "+91 98410 55620",
    jobTitle: "Engineering Team Lead", department: "Engineering", team: "Web Platform", managerId: "EMP-1004",
    location: "Bengaluru, IN", timezone: "Asia/Kolkata", workSchedule: "09:30 - 18:30 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Active", availability: "In Meeting", role: "Team Lead",
    skills: ["System Design", "Code Review", "Mentoring", "Node.js"], joinedOn: "2020-07-06",
  },
  {
    employeeId: "EMP-1003", employeeCode: "NX-1003", firstName: "Daniel", lastName: "Okoro",
    displayName: "Daniel Okoro", email: "daniel.okoro@protechsoft.com", password: "Portal@123", phone: "+44 7700 900312",
    jobTitle: "QA Automation Engineer", department: "Quality Engineering", team: "Web Platform", managerId: "EMP-1002",
    location: "London, UK", timezone: "Europe/London", workSchedule: "09:00 - 18:00 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Active", availability: "Busy", role: "Employee",
    skills: ["Playwright", "Cypress", "API Testing"], joinedOn: "2021-11-22",
  },
  {
    employeeId: "EMP-1004", employeeCode: "NX-1004", firstName: "Sophia", lastName: "Lindqvist",
    displayName: "Sophia Lindqvist", email: "sophia.lindqvist@protechsoft.com", password: "Portal@123", phone: "+46 70 123 4455",
    jobTitle: "Engineering Manager", department: "Engineering", team: "Platform Group", managerId: null,
    location: "Stockholm, SE", timezone: "Europe/Stockholm", workSchedule: "08:30 - 17:30 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Active", availability: "Available", role: "Manager",
    skills: ["Delivery Planning", "Architecture", "Stakeholder Management"], joinedOn: "2019-01-15",
  },
  {
    employeeId: "EMP-1005", employeeCode: "NX-1005", firstName: "Priya", lastName: "Venkatesh",
    displayName: "Priya Venkatesh", email: "priya.venkatesh@protechsoft.com", password: "Portal@123", phone: "+91 98450 77120",
    jobTitle: "Portal Administrator", department: "Corporate IT", team: "Workplace Systems", managerId: "EMP-1004",
    location: "Hyderabad, IN", timezone: "Asia/Kolkata", workSchedule: "10:00 - 19:00 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Active", availability: "Available", role: "Portal Administrator",
    skills: ["Identity", "Access Governance", "ServiceNow"], joinedOn: "2018-09-03",
  },
  {
    employeeId: "EMP-1006", employeeCode: "NX-1006", firstName: "Rafael", lastName: "Moreno",
    displayName: "Rafael Moreno", email: "rafael.moreno@protechsoft.com", password: "Portal@123", phone: "+34 611 220 998",
    jobTitle: "Product Designer", department: "Design", team: "Experience Design", managerId: "EMP-1004",
    location: "Madrid, ES", timezone: "Europe/Madrid", workSchedule: "09:00 - 18:00 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Inactive", availability: "Offline", role: "Employee",
    skills: ["Figma", "Design Tokens", "Research"], joinedOn: "2023-02-20",
  },
  {
    employeeId: "EMP-1007", employeeCode: "NX-1007", firstName: "Hannah", lastName: "Cole",
    displayName: "Hannah Cole", email: "hannah.cole@protechsoft.com", password: "Portal@123", phone: "+1 415 555 0198",
    jobTitle: "Technical Writer", department: "Documentation", team: "Content Systems", managerId: "EMP-1002",
    location: "San Francisco, US", timezone: "America/Los_Angeles", workSchedule: "09:00 - 18:00 (Mon-Fri)",
    employmentStatus: "Contract", accountStatus: "Locked", availability: "Offline", role: "Employee",
    skills: ["API Docs", "Information Architecture"], joinedOn: "2024-05-13",
  },
  {
    employeeId: "EMP-1008", employeeCode: "NX-1008", firstName: "Vikram", lastName: "Shetty",
    displayName: "Vikram Shetty", email: "vikram.shetty@protechsoft.com", password: "Portal@123", phone: "+91 99000 41220",
    jobTitle: "DevOps Engineer", department: "Platform Engineering", team: "Reliability", managerId: "EMP-1004",
    location: "Pune, IN", timezone: "Asia/Kolkata", workSchedule: "09:00 - 18:00 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Suspended", availability: "Offline", role: "Employee",
    skills: ["Kubernetes", "Terraform", "Observability"], joinedOn: "2021-04-01",
  },
  {
    employeeId: "EMP-1009", employeeCode: "NX-1009", firstName: "Ayesha", lastName: "Khan",
    displayName: "Ayesha Khan", email: "ayesha.khan@protechsoft.com", password: "Portal@123", phone: "+971 50 220 8811",
    jobTitle: "Business Analyst", department: "Product", team: "Customer Portal", managerId: "EMP-1004",
    location: "Dubai, AE", timezone: "Asia/Dubai", workSchedule: "09:00 - 18:00 (Sun-Thu)",
    employmentStatus: "Full-time", accountStatus: "Pending Activation", availability: "Offline", role: "Employee",
    skills: ["Requirements", "Process Mapping"], joinedOn: "2026-07-28",
  },
  {
    employeeId: "EMP-1010", employeeCode: "NX-1010", firstName: "Tom", lastName: "Bergström",
    displayName: "Tom Bergström", email: "tom.bergstrom@protechsoft.com", password: "Portal@123", phone: "+46 70 998 1122",
    jobTitle: "Support Engineer", department: "Customer Success", team: "Support Desk", managerId: "EMP-1002",
    location: "Gothenburg, SE", timezone: "Europe/Stockholm", workSchedule: "08:00 - 17:00 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Deactivated", availability: "Offline", role: "Employee",
    skills: ["Incident Triage", "SQL"], joinedOn: "2020-10-19",
  },
  {
    employeeId: "EMP-1011", employeeCode: "NX-1011", firstName: "Ingrid", lastName: "Nowak",
    displayName: "Ingrid Nowak", email: "ingrid.nowak@protechsoft.com", password: "Portal@123", phone: "+48 512 330 771",
    jobTitle: "System Administrator", department: "Corporate IT", team: "Workplace Systems", managerId: "EMP-1005",
    location: "Kraków, PL", timezone: "Europe/Warsaw", workSchedule: "09:00 - 18:00 (Mon-Fri)",
    employmentStatus: "Full-time", accountStatus: "Active", availability: "Away", role: "System Administrator",
    skills: ["Entra ID", "Endpoint Management"], joinedOn: "2017-06-12",
  },
  {
    employeeId: "EMP-1012", employeeCode: "NX-1012", firstName: "Kiran", lastName: "Das",
    displayName: "Kiran Das", email: "kiran.das@protechsoft.com", password: "Portal@123", phone: "+91 90030 55411",
    jobTitle: "Junior Frontend Engineer", department: "Engineering", team: "Web Platform", managerId: "EMP-1002",
    location: "Chennai, IN", timezone: "Asia/Kolkata", workSchedule: "09:00 - 18:00 (Mon-Fri)",
    employmentStatus: "Intern", accountStatus: "Active", availability: "Available", role: "Employee",
    skills: ["HTML", "CSS", "TypeScript"], joinedOn: "2026-06-01",
  },
];

const projectSeeds = [
  { name: "Employee Work Portal", code: "EWP", desc: "Unified employee workspace covering attendance, tasks, timeline and collaboration.", status: "Active" as const },
  { name: "Customer Portal Revamp", code: "CPR", desc: "Redesign of the external customer self-service portal with a new design system.", status: "Active" as const },
  { name: "Identity & Access Modernisation", code: "IAM", desc: "Migration of legacy sign-in to federated identity with MFA enforcement.", status: "On Hold" as const },
  { name: "Release Automation Pipeline", code: "RAP", desc: "Automated build, test and release orchestration across web services.", status: "Active" as const },
  { name: "Knowledge Hub Consolidation", code: "KHC", desc: "Consolidation of scattered internal documentation into a single knowledge base.", status: "Planned" as const },
  { name: "Legacy Reporting Retirement", code: "LRR", desc: "Decommissioning of the legacy reporting stack after data migration.", status: "Completed" as const },
];

const taskTitles = [
  ["Implement Employee Dashboard widgets", "Build the attendance, timeline and task summary widgets for the portal dashboard."],
  ["Review API integration for timeline service", "Verify contract alignment and error handling for the timeline data provider."],
  ["Fix authentication validation edge cases", "Handle locked, suspended and pending-activation accounts on the sign-in screen."],
  ["Prepare release notes for 4.2", "Summarise shipped features, fixes and known issues for the quarterly release."],
  ["Update customer portal navigation", "Restructure primary navigation based on the latest usability findings."],
  ["Review pull request #2841", "Code review for the notification centre refactor."],
  ["Test notification workflow end to end", "Validate task, meeting and approval notification delivery paths."],
  ["Refactor attendance duration calculation", "Move duration maths into a shared utility with unit coverage."],
  ["Add keyboard navigation to timeline", "Ensure timeline blocks are reachable and operable via keyboard."],
  ["Document design token usage", "Write internal guidance on semantic tokens and theming."],
  ["Optimise document list rendering", "Reduce re-renders on large document collections."],
  ["Migrate legacy reports to new schema", "Map legacy report fields onto the consolidated reporting schema."],
  ["Investigate slow project detail load", "Profile and resolve the render bottleneck on project detail."],
  ["Harden request submission validation", "Add field-level validation and clearer error messaging."],
  ["Prepare sprint demo walkthrough", "Assemble the demo script covering timeline and task integration."],
];

const meetingSeeds = [
  { title: "Web Platform Daily Stand-up", agenda: ["Yesterday's progress", "Today's plan", "Blockers"], loc: "Teams · Platform Channel" },
  { title: "Sprint Planning — Employee Work Portal", agenda: ["Backlog grooming", "Capacity check", "Sprint commitment"], loc: "Meeting Room 3A" },
  { title: "Design Review: Timeline Experience", agenda: ["Timeline density", "Empty states", "Accessibility review"], loc: "Teams · Design Sync" },
  { title: "Customer Portal Stakeholder Sync", agenda: ["Milestone status", "Risk register", "Next steps"], loc: "Teams · Stakeholders" },
  { title: "Release Readiness Review", agenda: ["Test coverage", "Open defects", "Go / no-go"], loc: "Meeting Room 1B" },
  { title: "Architecture Guild", agenda: ["Service boundaries", "Shared component strategy"], loc: "Teams · Guild" },
  { title: "1:1 with Meera Raghavan", agenda: ["Current workload", "Growth goals", "Feedback"], loc: "Meeting Room 2C" },
  { title: "Incident Retrospective — Auth Outage", agenda: ["Timeline of events", "Root cause", "Action items"], loc: "Teams · Reliability" },
];

function buildProjects(today: Date): Project[] {
  return projectSeeds.map((p, i) => ({
    projectId: `PRJ-${200 + i}`,
    name: p.name,
    code: p.code,
    description: p.desc,
    status: p.status,
    progress: p.status === "Completed" ? 100 : p.status === "Planned" ? 5 : int(25, 85),
    startDate: dateKey(addDays(today, -150 + i * 8)),
    endDate: dateKey(addDays(today, 60 + i * 20)),
    leadId: i % 2 === 0 ? "EMP-1002" : "EMP-1004",
    memberIds: ["EMP-1001", "EMP-1002", "EMP-1003", "EMP-1012"].slice(0, 2 + (i % 3)),
    milestones: [
      { milestoneId: `MS-${i}-1`, title: "Discovery complete", dueDate: dateKey(addDays(today, -90 + i * 5)), status: "Completed" },
      { milestoneId: `MS-${i}-2`, title: "Beta release", dueDate: dateKey(addDays(today, -10 + i * 6)), status: p.status === "Completed" ? "Completed" : "In Progress" },
      { milestoneId: `MS-${i}-3`, title: "General availability", dueDate: dateKey(addDays(today, 45 + i * 10)), status: "Planned" },
    ],
  }));
}

function buildTasks(today: Date, projects: Project[]): Task[] {
  const tasks: Task[] = [];
  let n = 0;
  for (let offset = -120; offset <= 40; offset += 1) {
    const day = addDays(today, offset);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue;
    const count = offset === 0 ? 4 : int(0, 3);
    for (let k = 0; k < count; k++) {
      const tt = pick(taskTitles) as string[];
      const title = tt[0] as string;
      const description = tt[1] as string;
      const project = pick(projects) as Project;
      const past = offset < 0;
      const status = (past
        ? (rnd() > 0.15 ? "Completed" : pick(["Blocked", "Under Review", "On Hold"] as const))
        : offset === 0
          ? pick(["Assigned", "In Progress", "Under Review", "Not Started"] as const)
          : "Not Started") as Task["status"];
      const progress = status === "Completed" ? 100 : status === "In Progress" ? int(20, 80) : status === "Under Review" ? 90 : 0;
      const owner = k === 3 ? "EMP-1012" : CURRENT_EMPLOYEE_ID;
      n += 1;
      tasks.push({
        taskId: `TSK-${3000 + n}`,
        employeeId: owner,
        title,
        description,
        projectId: project.projectId,
        assignedBy: pick(["EMP-1002", "EMP-1004"]) as string,
        assignedDate: dateKey(addDays(day, -2)),
        startDate: dateKey(day),
        dueDate: dateKey(addDays(day, int(0, 5))),
        priority: pick(["Low", "Medium", "High", "Critical"] as const) as Task["priority"],
        status,
        progress,
        estimatedHours: int(2, 12),
        actualHours: status === "Completed" ? int(2, 12) : int(0, 5),
        tags: [project.code, pick<string>(["frontend", "review", "release", "quality", "documentation"])],
        comments: rnd() > 0.7 ? [{ commentId: `CMT-${n}`, authorId: "EMP-1002", message: "Please attach the test evidence before moving this to review.", createdAt: iso(day, 11, 15) }] : [],
        createdAt: iso(addDays(day, -2), 9, 30),
        updatedAt: iso(day, 16, 0),
      });
    }
  }
  return tasks;
}

function buildMeetings(today: Date, projects: Project[]): Meeting[] {
  const meetings: Meeting[] = [];
  let n = 0;
  for (let offset = -120; offset <= 40; offset += 1) {
    const day = addDays(today, offset);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue;
    const count = offset === 0 ? 2 : rnd() > 0.55 ? 1 : rnd() > 0.85 ? 2 : 0;
    for (let k = 0; k < count; k++) {
      const seed = meetingSeeds[(n + k) % meetingSeeds.length] as (typeof meetingSeeds)[number];
      const startH = k === 0 ? 10 : 15;
      n += 1;
      meetings.push({
        meetingId: `MTG-${5000 + n}`,
        title: seed.title,
        description: `${seed.title} for the ${(pick(projects) as Project).name} workstream.`,
        organizerId: pick(["EMP-1002", "EMP-1004"]) as string,
        participantIds: ["EMP-1001", "EMP-1002", "EMP-1003", "EMP-1004"],
        date: dateKey(day),
        startTime: iso(day, startH, 0),
        endTime: iso(day, startH, 45),
        location: seed.loc,
        meetingLink: "https://meet.protechsoft.com/" + (5000 + n),
        agenda: seed.agenda,
        projectId: pick(projects).projectId as string,
        status: offset < 0 ? "Completed" : "Scheduled",
      });
    }
  }
  return meetings;
}

function buildAttendanceAndTimeline(today: Date, tasks: Task[], meetings: Meeting[]) {
  const attendance: Attendance[] = [];
  const timeline: TimelineBlock[] = [];
  for (let offset = -120; offset <= 40; offset += 1) {
    const day = addDays(today, offset);
    const key = dateKey(day);
    const dow = day.getDay();
    const weekend = dow === 0 || dow === 6;
    const future = offset > 0;
    const checkInHour = 8;
    const checkInMin = int(35, 59);
    const checkIn = weekend ? null : iso(day, checkInHour, checkInMin);
    const expected = checkIn ? addMinutes(new Date(checkIn), WORK_HOURS * 60).toISOString() : null;
    attendance.push({
      attendanceId: `ATT-${key}`,
      employeeId: CURRENT_EMPLOYEE_ID,
      date: key,
      checkInTime: offset === 0 ? null : future ? null : checkIn,
      expectedCompletionTime: offset === 0 ? null : future ? null : expected,
      actualLogoutTime: offset < 0 && !weekend ? iso(day, 17, int(40, 59)) : null,
      workDurationMinutes: offset < 0 && !weekend ? int(500, 560) : 0,
      breakDurationMinutes: offset < 0 && !weekend ? int(30, 60) : 0,
      status: weekend ? "Weekend" : offset < 0 ? (rnd() > 0.9 ? "Remote" : "Present") : future ? "Absent" : "Present",
      workStatus: offset < 0 ? "Work Completed" : "Working",
    });

    if (weekend) continue;

    if (!future) {
      timeline.push({
        id: `TLB-${key}-login`, employeeId: CURRENT_EMPLOYEE_ID, date: key, type: "LOGIN",
        title: "Signed in to Employee Portal", description: "Attendance check-in recorded from portal sign-in.",
        startTime: checkIn!, endTime: checkIn!, status: "Completed", priority: "Low",
      });
    }

    const dayTasks = tasks.filter((t) => t.startDate === key && t.employeeId === CURRENT_EMPLOYEE_ID);
    dayTasks.forEach((t, i) => {
      timeline.push({
        id: `TLB-${t.taskId}`, employeeId: CURRENT_EMPLOYEE_ID, date: key, type: "TASK",
        title: t.title, description: t.description,
        startTime: iso(day, 9 + i * 2, 30), endTime: iso(day, 11 + i * 2, 0),
        status: t.status === "Completed" ? "Completed" : future ? "Planned" : "Active",
        priority: t.priority, taskId: t.taskId, projectId: t.projectId,
      });
    });

    meetings.filter((m) => m.date === key).forEach((m) => {
      timeline.push({
        id: `TLB-${m.meetingId}`, employeeId: CURRENT_EMPLOYEE_ID, date: key, type: "MEETING",
        title: m.title, description: m.agenda.join(" · "),
        startTime: m.startTime, endTime: m.endTime,
        status: future ? "Planned" : "Completed", priority: "Medium",
        meetingId: m.meetingId, projectId: m.projectId,
      });
    });

    timeline.push({
      id: `TLB-${key}-break`, employeeId: CURRENT_EMPLOYEE_ID, date: key, type: "BREAK",
      title: "Lunch break", description: "Scheduled recovery break.",
      startTime: iso(day, 13, 0), endTime: iso(day, 13, 45),
      status: future ? "Planned" : "Completed", priority: "Low",
    });

    timeline.push({
      id: `TLB-${key}-focus`, employeeId: CURRENT_EMPLOYEE_ID, date: key, type: "FOCUS",
      title: "Focus block — deep work", description: "Protected time for implementation work without meetings.",
      startTime: iso(day, 15, 0), endTime: iso(day, 16, 30),
      status: future ? "Planned" : "Completed", priority: "Medium",
    });

    if (offset % 11 === 0) {
      timeline.push({
        id: `TLB-${key}-training`, employeeId: CURRENT_EMPLOYEE_ID, date: key, type: "TRAINING",
        title: "Secure coding refresher", description: "Mandatory quarterly security awareness module.",
        startTime: iso(day, 16, 45), endTime: iso(day, 17, 30),
        status: future ? "Planned" : "Completed", priority: "Medium",
      });
    }
  }
  return { attendance, timeline };
}

function buildRest(today: Date, tasks: Task[], projects: Project[], meetings: Meeting[]) {
  const announcements: Announcement[] = [
    ["Quarterly All-Hands: 4.2 Release Highlights", "Join the organisation-wide session covering the 4.2 release, platform roadmap and the new employee workspace rollout.", "Organisation", "High", 2],
    ["Mandatory Security Awareness Module", "All engineers must complete the secure coding refresher before the end of the month. Access it from the Knowledge Base.", "Security", "Critical", 6],
    ["Office Network Maintenance — Saturday", "The Chennai office network will be unavailable between 22:00 and 02:00 for switch replacement.", "Facilities", "Medium", 9],
    ["New Expense Submission Cut-off", "Business service requests raised after the 25th will be processed in the following cycle.", "Business Service", "Low", 14],
    ["Design System 3.0 Now Available", "Semantic tokens, new status badges and accessible dialog patterns are published to the internal registry.", "Engineering", "Medium", 21],
    ["Welcome to the Web Platform Team", "Kiran Das has joined the Web Platform team as a Junior Frontend Engineer.", "People", "Low", 30],
  ].map((a, i) => ({
    announcementId: `ANN-${400 + i}`,
    title: a[0] as string,
    description: a[1] as string,
    authorId: i % 2 === 0 ? "EMP-1004" : "EMP-1005",
    publishedAt: iso(addDays(today, -(a[4] as number)), 9, 0),
    expiresAt: iso(addDays(today, 30 - i), 18, 0),
    priority: a[3] as Announcement["priority"],
    category: a[2] as string,
    readBy: i > 3 ? [CURRENT_EMPLOYEE_ID] : [],
  }));

  const openTask = tasks.find((t) => t.status !== "Completed")!;
  const todayMeeting = meetings.find((m) => m.date === dateKey(today));

  const notifications: AppNotification[] = [
    {
      notificationId: "NTF-9001", employeeId: CURRENT_EMPLOYEE_ID, type: "task",
      title: "New task assigned", message: `${openTask.title} was assigned to you by Meera Raghavan.`,
      priority: "High", entityType: "task", entityId: openTask.taskId,
      createdAt: iso(today, 8, 20), readAt: null, actionUrl: `/tasks/${openTask.taskId}`,
    },
    {
      notificationId: "NTF-9002", employeeId: CURRENT_EMPLOYEE_ID, type: "meeting",
      title: "Meeting starting soon", message: todayMeeting ? `${todayMeeting.title} starts at 10:00.` : "Web Platform Daily Stand-up starts at 10:00.",
      priority: "Medium", entityType: "meeting", entityId: todayMeeting?.meetingId ?? "MTG-5001",
      createdAt: iso(today, 9, 45), readAt: null, actionUrl: todayMeeting ? `/meetings/${todayMeeting.meetingId}` : "/meetings",
    },
    {
      notificationId: "NTF-9003", employeeId: CURRENT_EMPLOYEE_ID, type: "approval",
      title: "Approval waiting on you", message: "Software access request for Figma Enterprise needs your review.",
      priority: "Medium", entityType: "approval", entityId: "APR-701",
      createdAt: iso(addDays(today, -1), 16, 10), readAt: null, actionUrl: "/approvals",
    },
    {
      notificationId: "NTF-9004", employeeId: CURRENT_EMPLOYEE_ID, type: "announcement",
      title: "Mandatory training published", message: "Secure coding refresher must be completed this month.",
      priority: "Critical", entityType: "announcement", entityId: "ANN-401",
      createdAt: iso(addDays(today, -2), 10, 0), readAt: null, actionUrl: "/announcements",
    },
    {
      notificationId: "NTF-9005", employeeId: CURRENT_EMPLOYEE_ID, type: "comment",
      title: "New comment on your task", message: "Meera Raghavan commented on the notification workflow task.",
      priority: "Low", entityType: "task", entityId: openTask.taskId,
      createdAt: iso(addDays(today, -3), 14, 25), readAt: iso(addDays(today, -3), 15, 0), actionUrl: `/tasks/${openTask.taskId}`,
    },
    {
      notificationId: "NTF-9006", employeeId: CURRENT_EMPLOYEE_ID, type: "document",
      title: "Document shared with you", message: "Release Readiness Checklist 4.2 was shared by Daniel Okoro.",
      priority: "Low", entityType: "document", entityId: "DOC-801",
      createdAt: iso(addDays(today, -4), 11, 5), readAt: iso(addDays(today, -4), 11, 30), actionUrl: "/documents",
    },
  ];

  const documents: DocumentItem[] = [
    ["Release Readiness Checklist 4.2", "Team Documents", "xlsx", 148],
    ["Employee Work Portal — Architecture Overview", "Project Documents", "pdf", 1240],
    ["Frontend Coding Standards", "Organization Documents", "pdf", 620],
    ["Information Security Policy", "Policies", "pdf", 980],
    ["Remote Working Guidelines", "Policies", "pdf", 410],
    ["Sprint Demo Script Template", "Templates", "docx", 96],
    ["Incident Report Template", "Templates", "docx", 88],
    ["Timeline Service API Contract", "Project Documents", "pdf", 512],
    ["My Weekly Planning Notes", "My Documents", "docx", 64],
    ["Customer Portal Usability Findings", "Shared Documents", "pdf", 1810],
    ["Onboarding Checklist — Web Platform", "Team Documents", "docx", 132],
    ["Design Token Reference", "Organization Documents", "pdf", 356],
  ].map((d, i) => ({
    documentId: `DOC-${800 + i}`,
    name: d[0] as string,
    category: d[1] as DocumentItem["category"],
    ownerId: (i % 3 === 0 ? CURRENT_EMPLOYEE_ID : pick(["EMP-1002", "EMP-1003", "EMP-1005"])) as string,
    projectId: (d[1] === "Project Documents" ? (projects[i % projects.length] as Project).projectId : undefined),
    fileType: d[2] as string,
    sizeKb: d[3] as number,
    version: `v1.${i % 5}`,
    updatedAt: iso(addDays(today, -int(1, 90)), 12, 0),
    archived: false,
    versions: [
      { version: "v1.0", updatedAt: iso(addDays(today, -120), 10, 0), note: "Initial publication" },
      { version: `v1.${i % 5}`, updatedAt: iso(addDays(today, -int(1, 60)), 15, 30), note: "Content review and formatting update" },
    ],
  }));

  const requests: EmployeeRequest[] = [
    ["IT Support", "Laptop running slow after latest update", "Performance dropped noticeably after the security patch rollout.", "In Progress"],
    ["Software Access", "Access to Figma Enterprise", "Need edit access to the Experience Design workspace for portal handoffs.", "Waiting for Employee"],
    ["Hardware", "Replacement docking station", "Existing dock no longer drives the second monitor.", "Assigned"],
    ["Application Access", "Production log viewer access", "Read-only access required for release verification.", "Resolved"],
    ["Facility", "Desk relocation to quiet zone", "Requesting a move to the focus area on floor 4.", "Submitted"],
    ["Security", "Report suspicious phishing email", "Received a credential harvesting email impersonating the IT desk.", "Closed"],
  ].map((r, i) => {
    const created = addDays(today, -int(1, 45));
    return {
      requestId: `REQ-${600 + i}`,
      employeeId: CURRENT_EMPLOYEE_ID,
      category: r[0] as EmployeeRequest["category"],
      title: r[1] as string,
      description: r[2] as string,
      priority: pick(["Low", "Medium", "High"] as const) as EmployeeRequest["priority"],
      status: r[3] as EmployeeRequest["status"],
      createdAt: created.toISOString(),
      updatedAt: addDays(created, 1).toISOString(),
      history: [
        { at: created.toISOString(), status: "Submitted", note: "Request submitted through the employee portal." },
        { at: addDays(created, 1).toISOString(), status: r[3] as EmployeeRequest["status"], note: "Status updated by the service desk." },
      ],
      comments: [{ authorId: "EMP-1005", message: "Thanks for raising this — the service desk is reviewing it now.", createdAt: addDays(created, 1).toISOString() }],
    };
  });

  const approvals: Approval[] = [
    { approvalId: "APR-701", approverId: CURRENT_EMPLOYEE_ID, requesterId: "EMP-1012", type: "Software Access", title: "Figma Enterprise seat for Kiran Das", summary: "Design collaboration access requested for portal handoffs.", submittedAt: iso(addDays(today, -1), 16, 10), status: "Pending", decidedAt: null },
    { approvalId: "APR-702", approverId: CURRENT_EMPLOYEE_ID, requesterId: "EMP-1003", type: "Document Share", title: "Share Release Readiness Checklist externally", summary: "Requesting approval to share the checklist with the partner QA team.", submittedAt: iso(addDays(today, -2), 11, 20), status: "Pending", decidedAt: null },
    { approvalId: "APR-703", approverId: CURRENT_EMPLOYEE_ID, requesterId: "EMP-1012", type: "Task Extension", title: "Extend due date for navigation refactor", summary: "Two additional days requested due to dependency on the design review.", submittedAt: iso(addDays(today, -9), 9, 40), status: "Approved", decidedAt: iso(addDays(today, -8), 10, 15) },
  ];

  const knowledge: KnowledgeArticle[] = [
    ["Setting up the Web Platform development environment", "Internal Guides", "Node version, workspace bootstrap and local proxy configuration."],
    ["Frontend code review checklist", "Development Standards", "What reviewers look for: accessibility, tokens, tests and performance."],
    ["Timeline Service API reference", "Technical Documentation", "Endpoints, payload contracts and error codes for the timeline provider."],
    ["Handling production incidents", "Processes", "Severity levels, escalation paths and communication expectations."],
    ["Secure coding guidelines", "Security Guidelines", "Input validation, session handling and secret management rules."],
    ["Employee Portal feature overview", "Product Documentation", "Modules available in the portal and how they relate to each other."],
    ["Why is my attendance not recorded?", "Troubleshooting", "Common causes and how to raise a correction request."],
    ["Frequently asked questions about access requests", "FAQs", "Turnaround times, approvers and escalation."],
  ].map((k, i) => ({
    articleId: `KB-${900 + i}`,
    title: k[0] as string,
    category: k[1] as string,
    summary: k[2] as string,
    body: `${k[2]}\n\nThis article is maintained by the Web Platform enablement group. It is reviewed every quarter and updated when the underlying process or service contract changes.\n\nIf something here is out of date, raise an IT Support request from the portal and reference this article identifier.`,
    authorId: pick(["EMP-1002", "EMP-1005", "EMP-1011"]) as string,
    updatedAt: iso(addDays(today, -int(3, 80)), 12, 0),
    tags: [k[1] as string, "portal"],
    relatedIds: [`KB-${900 + ((i + 1) % 8)}`, `KB-${900 + ((i + 2) % 8)}`],
  }));

  const notes: Note[] = [
    { noteId: "NOT-501", employeeId: CURRENT_EMPLOYEE_ID, title: "Stand-up talking points", content: "<p><strong>Yesterday:</strong> finished the timeline block component.</p><ul><li>Today: task ↔ timeline integration</li><li>Blocker: waiting on design review</li></ul>", category: "Daily", pinned: true, archived: false, createdAt: iso(addDays(today, -1), 9, 10), updatedAt: iso(today, 8, 55) },
    { noteId: "NOT-502", employeeId: CURRENT_EMPLOYEE_ID, title: "Release 4.2 checklist", content: "<p>Confirm regression pack, update release notes, notify support desk.</p>", category: "Release", pinned: false, archived: false, createdAt: iso(addDays(today, -6), 15, 0), updatedAt: iso(addDays(today, -4), 10, 0) },
    { noteId: "NOT-503", employeeId: CURRENT_EMPLOYEE_ID, title: "Design review feedback", content: "<p><em>Timeline density</em> should reduce on mobile. Add empty state copy per module.</p>", category: "Meeting", pinned: false, archived: false, meetingId: meetings[0]?.meetingId as string | undefined, createdAt: iso(addDays(today, -12), 11, 30), updatedAt: iso(addDays(today, -12), 11, 45) },
    { noteId: "NOT-504", employeeId: CURRENT_EMPLOYEE_ID, title: "Old sprint retro notes", content: "<p>Archived retro actions from the previous cycle.</p>", category: "Retro", pinned: false, archived: true, createdAt: iso(addDays(today, -40), 16, 0), updatedAt: iso(addDays(today, -40), 16, 20) },
  ];

  const reminders: Reminder[] = [
    { reminderId: "RMD-301", employeeId: CURRENT_EMPLOYEE_ID, title: "Submit weekly status update", description: "Send the Web Platform weekly summary to Sophia.", date: dateKey(today), time: "17:00", priority: "High", status: "Pending", createdAt: iso(addDays(today, -2), 9, 0) },
    { reminderId: "RMD-302", employeeId: CURRENT_EMPLOYEE_ID, title: "Complete secure coding module", description: "Mandatory security training deadline this month.", date: dateKey(addDays(today, 3)), time: "11:00", priority: "Critical", status: "Pending", createdAt: iso(addDays(today, -5), 10, 0) },
    { reminderId: "RMD-303", employeeId: CURRENT_EMPLOYEE_ID, title: "Review Kiran's pull request", description: "Follow up on the navigation refactor review.", date: dateKey(addDays(today, -2)), time: "15:30", priority: "Medium", status: "Completed", createdAt: iso(addDays(today, -4), 9, 0) },
  ];

  const recognition: Recognition[] = [
    { recognitionId: "REC-101", fromId: "EMP-1002", toId: CURRENT_EMPLOYEE_ID, message: "Outstanding work stabilising the timeline rendering ahead of the demo.", badge: "Above and Beyond", createdAt: iso(addDays(today, -7), 14, 0) },
    { recognitionId: "REC-102", fromId: "EMP-1004", toId: CURRENT_EMPLOYEE_ID, message: "Great cross-team collaboration on the authentication fixes.", badge: "Team Player", createdAt: iso(addDays(today, -21), 10, 30) },
    { recognitionId: "REC-103", fromId: CURRENT_EMPLOYEE_ID, toId: "EMP-1003", message: "Thanks for the fast turnaround on the regression pack.", badge: "Quality First", createdAt: iso(addDays(today, -10), 16, 45) },
  ];

  const activity: ActivityEntry[] = [];
  for (let i = 1; i <= 24; i++) {
    const day = addDays(today, -i);
    activity.push({
      activityId: `ACT-${i}`, employeeId: CURRENT_EMPLOYEE_ID,
      action: pick<string>(["Task completed", "Meeting joined", "Note created", "Document viewed", "Status changed", "Request created"]),
      detail: pick<string>(["Completed the release notes preparation task.", "Joined the Web Platform Daily Stand-up.", "Created a note for design review feedback.", "Opened the Frontend Coding Standards document.", "Set availability to Focus Time.", "Raised an IT Support request for the docking station."]),
      entityType: "portal", entityId: `EVT-${i}`, timestamp: iso(day, int(9, 17), int(0, 59)),
    });
  }

  return { announcements, notifications, documents, requests, approvals, knowledge, notes, reminders, recognition, activity };
}

export function buildSeedState(now: Date): PortalState {
  seedState = 20260812;
  const today = startOfDay(now);
  const projects = buildProjects(today);
  const tasks = buildTasks(today, projects);
  const meetings = buildMeetings(today, projects);
  const { attendance, timeline } = buildAttendanceAndTimeline(today, tasks, meetings);
  const rest = buildRest(today, tasks, projects, meetings);

  return {
    seedDate: dateKey(today),
    employees,
    tasks,
    projects,
    meetings,
    timeline,
    attendance,
    audit: [],
    session: null,
    settings: {
      language: "English (United Kingdom)",
      timezone: "Asia/Kolkata",
      notifyTasks: true,
      notifyMeetings: true,
      notifyAnnouncements: true,
      notifySystem: false,
      theme: "light",
      presenceVisible: true,
      directoryVisible: true,
      mfaEnabled: true,
      sessions: [
        { sessionId: "SES-CURRENT", device: "Chrome · Windows 11 · Chennai", lastActive: now.toISOString(), current: true },
        { sessionId: "SES-2", device: "Safari · iPhone 15 · Chennai", lastActive: addDays(now, -2).toISOString(), current: false },
      ],
    },
    ...rest,
  };
}
