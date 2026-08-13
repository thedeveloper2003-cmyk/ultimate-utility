import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TasksService } from './tasks.service';
import { MeetingsService } from './meetings.service';
import { DocumentsService } from './documents.service';

export interface PortalState {
  tasks: any[];
  meetings: any[];
  projects: any[];
  notifications: any[];
  requests: any[];
  activity: any[];
  announcements: any[];
  employees: any[];
  session: any | null;
  timeline: any[];
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

@Injectable({ providedIn: 'root' })
export class PortalService {
  private projects$ = new BehaviorSubject<any[]>([
    { projectId: 'proj-1', title: 'New Website', memberIds: ['1'], leadId: '1', status: 'Active' },
    { projectId: 'proj-2', title: 'Mobile App', memberIds: ['2'], leadId: '2', status: 'Active' }
  ]);
  private notifications$ = new BehaviorSubject<any[]>([]);
  private requests$ = new BehaviorSubject<any[]>([]);
  private activity$ = new BehaviorSubject<any[]>([]);
  private announcements$ = new BehaviorSubject<any[]>([]);
  private employees$ = new BehaviorSubject<any[]>([
    { employeeId: '1', firstName: 'Alex', jobTitle: 'Engineer', team: 'Platform' }
  ]);
  private session$ = new BehaviorSubject<any>({ loginTime: new Date().toISOString() });
  private timeline$ = new BehaviorSubject<any[]>([]);

  constructor(private tasks: TasksService, private meetings: MeetingsService, private documents: DocumentsService) {}

  tasks$(): Observable<any[] | null> { return this.tasks.loadAll(); }
  meetings$(): Observable<any[] | null> { return this.meetings.loadAll(); }
  documents$(): Observable<any[] | null> { return this.documents.loadAll(); }
  projectsObs$(): Observable<any[]> { return this.projects$.asObservable(); }
  notificationsObs$(): Observable<any[]> { return this.notifications$.asObservable(); }
  requestsObs$(): Observable<any[]> { return this.requests$.asObservable(); }
  activityObs$(): Observable<any[]> { return this.activity$.asObservable(); }
  announcementsObs$(): Observable<any[]> { return this.announcements$.asObservable(); }
  employeesObs$(): Observable<any[]> { return this.employees$.asObservable(); }
  sessionObs$(): Observable<any | null> { return this.session$.asObservable(); }
  timelineObs$(): Observable<any[]> { return this.timeline$.asObservable(); }

  // Combined portal state
  state$(): Observable<PortalState> {
    return combineLatest([
      this.tasks$(),
      this.meetings$(),
      this.projectsObs$(),
      this.notificationsObs$(),
      this.requestsObs$(),
      this.activityObs$(),
      this.announcementsObs$(),
      this.employeesObs$(),
      this.sessionObs$(),
      this.timelineObs$(),
    ]).pipe(
      map(([tasks, meetings, projects, notifications, requests, activity, announcements, employees, session, timeline]) => ({
        tasks: tasks ?? [],
        meetings: meetings ?? [],
        projects,
        notifications,
        requests,
        activity,
        announcements,
        employees,
        session,
        timeline,
      }))
    );
  }

  // helpers
  fmtDate(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString();
  }
  fmtTime(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  fmtDuration(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }
  dateKey(d: Date) { return dateKey(d); }
  // simplified work progress (placeholder)
  workProgress(checkInIso: string | null, now: Date) {
    const start = checkInIso ? new Date(checkInIso) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
    const workedMinutes = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
    const expectedEnd = new Date(start.getTime() + 9 * 60 * 60000);
    const remaining = Math.max(0, Math.floor((expectedEnd.getTime() - now.getTime()) / 60000));
    const percent = Math.min(100, Math.round((workedMinutes / (9 * 60)) * 100));
    return { workedMinutes, remainingMinutes: remaining, expected: this.fmtTime(expectedEnd.toISOString()), percent };
  }
}
