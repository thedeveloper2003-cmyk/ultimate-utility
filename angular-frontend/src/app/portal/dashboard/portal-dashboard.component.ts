import { Component } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PortalService } from '../services/portal.service';

@Component({
  selector: 'app-portal-dashboard',
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold">Good day, {{ (vm$ | async)?.me?.firstName || 'there' }}</h1>
        <p class="text-sm text-muted-foreground">{{ (vm$ | async)?.todayLabel }}</p>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <section class="surface-card p-4">
          <h4 class="text-sm text-muted-foreground">Today's attendance</h4>
          <div class="mt-2">
            <p class="tabular text-lg font-semibold">{{ (vm$ | async)?.checkInTime }}</p>
            <p class="text-xs text-muted-foreground">Expected end: {{ (vm$ | async)?.expectedEnd }}</p>
            <div class="mt-2">
              <div class="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Worked {{ (vm$ | async)?.worked }}</span>
                <span>{{ (vm$ | async)?.percent }}%</span>
              </div>
              <div class="h-2 bg-gray-200 rounded overflow-hidden">
                <div class="bg-blue-600 h-full" [style.width.%]="(vm$ | async)?.percent"></div>
              </div>
              <p class="mt-1 text-[11px] text-muted-foreground">{{ (vm$ | async)?.remaining }} remaining</p>
            </div>
          </div>
          <a routerLink="/portal/attendance" class="inline-block mt-3 text-sm text-blue-600">View attendance history</a>
        </section>

        <div class="grid gap-3 sm:grid-cols-2 lg:col-span-2">
          <a routerLink="/portal/tasks" class="surface-card flex items-start gap-3 p-4">
            <div>
              <p class="text-xs text-muted-foreground">Open tasks</p>
              <p class="tabular text-xl font-semibold">{{ (vm$ | async)?.openTasksCount }}</p>
              <p class="text-[11px] text-muted-foreground">{{ (vm$ | async)?.dueTodayCount }} due today · {{ (vm$ | async)?.overdueCount }} overdue</p>
            </div>
          </a>

          <a routerLink="/portal/meetings" class="surface-card flex items-start gap-3 p-4">
            <div>
              <p class="text-xs text-muted-foreground">Meetings today</p>
              <p class="tabular text-xl font-semibold">{{ (vm$ | async)?.meetingsTodayCount }}</p>
              <p class="text-[11px] text-muted-foreground">{{ (vm$ | async)?.nextMeeting }}</p>
            </div>
          </a>

          <a routerLink="/portal/projects" class="surface-card flex items-start gap-3 p-4">
            <div>
              <p class="text-xs text-muted-foreground">Active projects</p>
              <p class="tabular text-xl font-semibold">{{ (vm$ | async)?.activeProjects }}</p>
              <p class="text-[11px] text-muted-foreground">{{ (vm$ | async)?.projectsCount }} total</p>
            </div>
          </a>

          <a routerLink="/portal/notifications" class="surface-card flex items-start gap-3 p-4">
            <div>
              <p class="text-xs text-muted-foreground">Unread notifications</p>
              <p class="tabular text-xl font-semibold">{{ (vm$ | async)?.unreadCount }}</p>
              <p class="text-[11px] text-muted-foreground">{{ (vm$ | async)?.notificationsCount }} in inbox</p>
            </div>
          </a>

          <a routerLink="/portal/requests" class="surface-card flex items-start gap-3 p-4">
            <div>
              <p class="text-xs text-muted-foreground">Open requests</p>
              <p class="tabular text-xl font-semibold">{{ (vm$ | async)?.pendingRequests }}</p>
              <p class="text-[11px] text-muted-foreground">{{ (vm$ | async)?.approvalsPending }} approvals pending</p>
            </div>
          </a>
        </div>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <section class="lg:col-span-2 surface-card p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">Today's timeline</h3>
            <a routerLink="/portal/timeline" class="text-sm text-blue-600">Open</a>
          </div>
          <div *ngIf="(vm$ | async)?.timeline?.length === 0" class="text-sm text-muted-foreground">No timeline items</div>
          <ul *ngIf="(vm$ | async)?.timeline?.length > 0" class="space-y-2">
            <li *ngFor="let b of (vm$ | async)?.timeline">{{ b.title }}</li>
          </ul>
        </section>

        <section class="surface-card p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">Meetings today</h3>
            <a routerLink="/portal/meetings" class="text-sm text-blue-600">All</a>
          </div>
          <div *ngIf="(vm$ | async)?.meetingsTodayCount === 0" class="text-sm text-muted-foreground">No meetings scheduled</div>
          <ul *ngIf="(vm$ | async)?.meetingsTodayCount > 0" class="space-y-2">
            <li *ngFor="let m of (vm$ | async)?.todaysMeetings">{{ m.title }} — {{ m.startTime }}</li>
          </ul>
        </section>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <section class="lg:col-span-2 surface-card p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">Priority tasks</h3>
            <a routerLink="/portal/tasks" class="text-sm text-blue-600">All tasks</a>
          </div>
          <div *ngIf="(vm$ | async)?.priorityTasks?.length === 0" class="text-sm text-muted-foreground">Nothing open</div>
          <div *ngIf="(vm$ | async)?.priorityTasks?.length > 0" class="grid gap-2 sm:grid-cols-2">
            <div *ngFor="let t of (vm$ | async)?.priorityTasks" class="p-2 bg-white border rounded">{{ t.title }}</div>
          </div>
        </section>

        <section class="surface-card p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">Recent activity</h3>
            <a routerLink="/portal/activity" class="text-sm text-blue-600">Log</a>
          </div>
          <div *ngIf="(vm$ | async)?.recentActivity?.length === 0" class="text-sm text-muted-foreground">No activity yet</div>
          <ol *ngIf="(vm$ | async)?.recentActivity?.length > 0" class="space-y-2">
            <li *ngFor="let a of (vm$ | async)?.recentActivity" class="rounded-md border bg-card p-2.5">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-medium">{{ a.action }}</p>
                <span class="tabular text-[11px] text-muted-foreground">{{ a.timestamp }}</span>
              </div>
              <p class="line-clamp-2 text-[11px] text-muted-foreground">{{ a.detail }}</p>
            </li>
          </ol>
        </section>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-3">
        <section class="lg:col-span-2 surface-card p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">My projects</h3>
            <a routerLink="/portal/projects" class="text-sm text-blue-600">All projects</a>
          </div>
          <div *ngIf="(vm$ | async)?.myProjects?.length === 0" class="text-sm text-muted-foreground">No projects</div>
          <div *ngIf="(vm$ | async)?.myProjects?.length > 0" class="grid gap-2 sm:grid-cols-2">
            <div *ngFor="let p of (vm$ | async)?.myProjects" class="p-2 bg-white border rounded">{{ p.title }}</div>
          </div>
        </section>

        <section class="surface-card p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">Announcements</h3>
            <a routerLink="/portal/announcements" class="text-sm text-blue-600">All</a>
          </div>
          <div class="space-y-2">
            <div *ngFor="let a of (vm$ | async)?.announcements | slice:0:4" class="block rounded-md border bg-card p-2.5">
              <div class="flex items-center justify-between gap-2">
                <p class="truncate text-xs font-medium">{{ a.title }}</p>
                <span class="text-xs">{{ a.priority }}</span>
              </div>
              <p class="line-clamp-2 text-[11px] text-muted-foreground">{{ a.description }}</p>
            </div>
            <a routerLink="/portal/team" class="inline-block mt-2 text-sm text-blue-600">Open my team</a>
          </div>
        </section>
      </div>
    </div>
  `
})
export class PortalDashboardComponent {
  vm$: Observable<any>;

  constructor(private portal: PortalService) {
    const now = new Date();
    this.vm$ = this.portal.state$().pipe(
      map((s) => {
        const me = s.employees[0] ?? null;
        const key = this.portal.dateKey(now);
        const openTasks = s.tasks.filter((t: any) => t.employeeId === me?.employeeId && !['Completed', 'Cancelled'].includes(t.status));
        const dueToday = openTasks.filter((t: any) => t.dueDate === key);
        const overdue = openTasks.filter((t: any) => t.dueDate < key);
        const completedThisMonth = s.tasks.filter((t: any) => t.status === 'Completed' && t.updatedAt && t.updatedAt.slice(0, 7) === key.slice(0, 7));
        const todaysBlocks = s.timeline.filter((b: any) => b.date === key && b.employeeId === me?.employeeId);
        const todaysMeetings = s.meetings.filter((m: any) => m.date === key && (m.participantIds?.includes(me?.employeeId) || m.organizerId === me?.employeeId))
          .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
        const myProjects = s.projects.filter((p: any) => (p.memberIds || []).includes(me?.employeeId) || p.leadId === me?.employeeId);
        const unread = s.notifications.filter((n: any) => n.employeeId === me?.employeeId && !n.readAt);
        const pendingRequests = s.requests.filter((r: any) => !['Resolved', 'Closed', 'Rejected'].includes(r.status));
        const recentActivity = s.activity.filter((a: any) => a.employeeId === me?.employeeId).slice(0, 6);
        const priorityTasks = [...openTasks].sort((a: any, b: any) => {
          const rank: any = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          return (rank[a.priority] - rank[b.priority]) || (a.dueDate || '').localeCompare(b.dueDate || '');
        }).slice(0, 4);

        const work = this.portal.workProgress(s.session?.loginTime ?? null, now);

        return {
          s,
          me,
          todayLabel: `${this.portal.fmtDate(now.toISOString())} · ${me?.jobTitle ?? ''} · ${me?.team ?? ''}`,
          checkInTime: this.portal.fmtTime(s.session?.loginTime),
          expectedEnd: work.expected,
          worked: this.portal.fmtDuration(work.workedMinutes),
          remaining: this.portal.fmtDuration(work.remainingMinutes),
          percent: work.percent,
          openTasksCount: openTasks.length,
          dueTodayCount: dueToday.length,
          overdueCount: overdue.length,
          meetingsTodayCount: todaysMeetings.length,
          nextMeeting: todaysMeetings[0] ? this.portal.fmtTime(todaysMeetings[0].startTime) : 'Nothing scheduled',
          activeProjects: myProjects.filter((p: any) => p.status === 'Active').length,
          projectsCount: myProjects.length,
          unreadCount: unread.length,
          notificationsCount: s.notifications.length,
          pendingRequests: pendingRequests.length,
          approvalsPending: s.approvals ? s.approvals.filter((a: any) => a.status === 'Pending').length : 0,
          timeline: todaysBlocks,
          todaysMeetings,
          priorityTasks,
          recentActivity,
          myProjects,
          announcements: s.announcements,
        };
      })
    );
  }
}
