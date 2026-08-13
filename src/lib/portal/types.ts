export type AccountStatus =
  | "Active"
  | "Inactive"
  | "Locked"
  | "Suspended"
  | "Pending Activation"
  | "Deactivated";

export type Availability =
  | "Available"
  | "Busy"
  | "In Meeting"
  | "Do Not Disturb"
  | "Away"
  | "Offline";

export type WorkStatus = "Working" | "On Break" | "Focus Time" | "Work Completed";

export type Role = "Employee" | "Team Lead" | "Manager" | "Portal Administrator" | "System Administrator";

export type Permission =
  | "TASK_VIEW" | "TASK_CREATE" | "TASK_UPDATE" | "TASK_ASSIGN" | "TASK_COMPLETE"
  | "PROJECT_VIEW" | "PROJECT_UPDATE"
  | "DOCUMENT_VIEW" | "DOCUMENT_UPLOAD" | "DOCUMENT_SHARE"
  | "REQUEST_CREATE" | "REQUEST_VIEW" | "REQUEST_UPDATE"
  | "ANNOUNCEMENT_VIEW" | "ANNOUNCEMENT_CREATE"
  | "APPROVAL_ACT"
  | "DIRECTORY_VIEW";

export interface Employee {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
  phone: string;
  jobTitle: string;
  department: string;
  team: string;
  managerId: string | null;
  location: string;
  timezone: string;
  workSchedule: string;
  employmentStatus: "Full-time" | "Contract" | "Intern";
  accountStatus: AccountStatus;
  availability: Availability;
  role: Role;
  skills: string[];
  joinedOn: string;
}

export type TaskStatus =
  | "Not Started" | "Assigned" | "In Progress" | "Blocked"
  | "On Hold" | "Under Review" | "Completed" | "Cancelled";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface TaskComment {
  commentId: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface Task {
  taskId: string;
  employeeId: string;
  title: string;
  description: string;
  projectId: string;
  assignedBy: string;
  assignedDate: string;
  startDate: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  progress: number;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export type BlockType =
  | "LOGIN" | "TASK" | "MEETING" | "BREAK" | "EVENT" | "TRAINING" | "FOCUS" | "PROJECT" | "OTHER";

export interface TimelineBlock {
  id: string;
  employeeId: string;
  date: string;
  type: BlockType;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "Planned" | "Active" | "Completed" | "Skipped";
  priority: Priority;
  taskId?: string | undefined;
  projectId?: string | undefined;
  meetingId?: string | undefined;
}

export interface Attendance {
  attendanceId: string;
  employeeId: string;
  date: string;
  checkInTime: string | null;
  expectedCompletionTime: string | null;
  actualLogoutTime: string | null;
  workDurationMinutes: number;
  breakDurationMinutes: number;
  status: "Present" | "Remote" | "Leave" | "Weekend" | "Holiday" | "Absent";
  workStatus: WorkStatus;
}

export interface Project {
  projectId: string;
  name: string;
  code: string;
  description: string;
  status: "Planned" | "Active" | "On Hold" | "Completed" | "Cancelled";
  progress: number;
  startDate: string;
  endDate: string;
  leadId: string;
  memberIds: string[];
  milestones: { milestoneId: string; title: string; dueDate: string; status: string }[];
}

export interface Meeting {
  meetingId: string;
  title: string;
  description: string;
  organizerId: string;
  participantIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingLink: string;
  agenda: string[];
  projectId?: string | undefined;
  taskId?: string | undefined;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
}

export interface Note {
  noteId: string;
  employeeId: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  archived: boolean;
  taskId?: string | undefined;
  meetingId?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  reminderId: string;
  employeeId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: Priority;
  status: "Pending" | "Completed" | "Dismissed";
  createdAt: string;
}

export interface Announcement {
  announcementId: string;
  title: string;
  description: string;
  authorId: string;
  publishedAt: string;
  expiresAt: string;
  priority: Priority;
  category: string;
  readBy: string[];
}

export interface AppNotification {
  notificationId: string;
  employeeId: string;
  type: "task" | "meeting" | "announcement" | "approval" | "document" | "comment" | "mention" | "system" | "reminder";
  title: string;
  message: string;
  priority: Priority;
  entityType: string;
  entityId: string;
  createdAt: string;
  readAt: string | null;
  actionUrl: string;
}

export interface DocumentItem {
  documentId: string;
  name: string;
  category: "My Documents" | "Shared Documents" | "Team Documents" | "Organization Documents" | "Project Documents" | "Policies" | "Templates";
  ownerId: string;
  projectId?: string | undefined;
  fileType: string;
  sizeKb: number;
  version: string;
  updatedAt: string;
  archived: boolean;
  versions: { version: string; updatedAt: string; note: string }[];
}

export type RequestStatus =
  | "Submitted" | "Received" | "Assigned" | "In Progress" | "Waiting for Employee" | "Resolved" | "Closed";

export interface EmployeeRequest {
  requestId: string;
  employeeId: string;
  category: "IT Support" | "Software Access" | "Hardware" | "Application Access" | "Facility" | "Security" | "Workspace" | "Business Service";
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  history: { at: string; status: RequestStatus; note: string }[];
  comments: { authorId: string; message: string; createdAt: string }[];
}

export interface Approval {
  approvalId: string;
  approverId: string;
  requesterId: string;
  type: string;
  title: string;
  summary: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected" | "Changes Requested";
  decidedAt: string | null;
}

export interface KnowledgeArticle {
  articleId: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  authorId: string;
  updatedAt: string;
  tags: string[];
  relatedIds: string[];
}

export interface Recognition {
  recognitionId: string;
  fromId: string;
  toId: string;
  message: string;
  badge: string;
  createdAt: string;
}

export interface ActivityEntry {
  activityId: string;
  employeeId: string;
  action: string;
  detail: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export interface AuditEntry {
  auditId: string;
  employeeId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  sessionId: string;
}

export interface Settings {
  language: string;
  timezone: string;
  notifyTasks: boolean;
  notifyMeetings: boolean;
  notifyAnnouncements: boolean;
  notifySystem: boolean;
  theme: "light" | "dark" | "system";
  presenceVisible: boolean;
  directoryVisible: boolean;
  mfaEnabled: boolean;
  sessions: { sessionId: string; device: string; lastActive: string; current: boolean }[];
}

export interface Session {
  sessionId: string;
  employeeId: string;
  loginTime: string;
  active: boolean;
}

export interface PortalState {
  seedDate: string;
  employees: Employee[];
  tasks: Task[];
  projects: Project[];
  meetings: Meeting[];
  timeline: TimelineBlock[];
  attendance: Attendance[];
  notes: Note[];
  reminders: Reminder[];
  announcements: Announcement[];
  notifications: AppNotification[];
  documents: DocumentItem[];
  requests: EmployeeRequest[];
  approvals: Approval[];
  knowledge: KnowledgeArticle[];
  recognition: Recognition[];
  activity: ActivityEntry[];
  audit: AuditEntry[];
  settings: Settings;
  session: Session | null;
}
