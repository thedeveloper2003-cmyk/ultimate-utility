import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PortalShellComponent } from './portal-shell/portal-shell.component';
import { PortalDashboardComponent } from './dashboard/portal-dashboard.component';
import { PortalTasksIndexComponent } from './tasks/portal-tasks-index.component';
import { PortalCalendarComponent } from './calendar/portal-calendar.component';
import { PortalMeetingsIndexComponent } from './meetings/portal-meetings-index.component';
import { PortalMeetingComponent } from './meetings/portal-meeting.component';
import { PortalDocumentsIndexComponent } from './documents/portal-documents-index.component';
import { PortalDocumentComponent } from './documents/portal-document.component';
import { PortalProjectsIndexComponent } from './projects/portal-projects-index.component';
import { PortalProjectComponent } from './projects/portal-project.component';
import { PortalActivityComponent } from './activity/portal-activity.component';
import { PortalAnnouncementsComponent } from './announcements/portal-announcements.component';
import { PortalApprovalsComponent } from './approvals/portal-approvals.component';
import { PortalAttendanceComponent } from './attendance/portal-attendance.component';
import { PortalHelpComponent } from './help/portal-help.component';
import { PortalKnowledgeComponent } from './knowledge/portal-knowledge.component';
import { PortalNotesComponent } from './notes/portal-notes.component';
import { PortalNotificationsComponent } from './notifications/portal-notifications.component';
import { PortalOrganizationComponent } from './organization/portal-organization.component';
import { PortalProfileComponent } from './profile/portal-profile.component';
import { PortalRecognitionComponent } from './recognition/portal-recognition.component';
import { PortalRemindersComponent } from './reminders/portal-reminders.component';
import { PortalSettingsComponent } from './settings/portal-settings.component';
import { PortalTeamComponent } from './team/portal-team.component';
import { PortalTimelineComponent } from './timeline/portal-timeline.component';
import { PortalRequestsIndexComponent } from './requests/portal-requests-index.component';
import { PortalRequestComponent } from './requests/portal-request.component';

const routes: Routes = [
  { path: '', component: PortalShellComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PortalDashboardComponent },
      { path: 'activity', component: PortalActivityComponent },
      { path: 'announcements', component: PortalAnnouncementsComponent },
      { path: 'approvals', component: PortalApprovalsComponent },
      { path: 'attendance', component: PortalAttendanceComponent },
      { path: 'calendar', component: PortalCalendarComponent },
      { path: 'dashboard', component: PortalDashboardComponent },
      { path: 'help', component: PortalHelpComponent },
      { path: 'knowledge', component: PortalKnowledgeComponent },
      { path: 'notes', component: PortalNotesComponent },
      { path: 'notifications', component: PortalNotificationsComponent },
      { path: 'organization', component: PortalOrganizationComponent },
      { path: 'profile', component: PortalProfileComponent },
      { path: 'recognition', component: PortalRecognitionComponent },
      { path: 'reminders', component: PortalRemindersComponent },
      { path: 'settings', component: PortalSettingsComponent },
      { path: 'team', component: PortalTeamComponent },
      { path: 'timeline', component: PortalTimelineComponent },
      { path: 'documents', component: PortalDocumentsIndexComponent },
      { path: 'documents/:documentId', component: PortalDocumentComponent },
      { path: 'meetings', component: PortalMeetingsIndexComponent },
      { path: 'meetings/:meetingId', component: PortalMeetingComponent },
      { path: 'projects', component: PortalProjectsIndexComponent },
      { path: 'projects/:projectId', component: PortalProjectComponent },
      { path: 'requests', component: PortalRequestsIndexComponent },
      { path: 'requests/:requestId', component: PortalRequestComponent },
      { path: 'tasks', component: PortalTasksIndexComponent },
      { path: 'tasks/:taskId', component: PortalTasksIndexComponent }
    ] }
];

@NgModule({
  declarations: [
    PortalShellComponent,
    PortalDashboardComponent,
    PortalTasksIndexComponent,
    PortalCalendarComponent,
    PortalMeetingsIndexComponent,
    PortalMeetingComponent,
    PortalDocumentsIndexComponent,
    PortalDocumentComponent,
    PortalProjectsIndexComponent,
    PortalProjectComponent,
    PortalActivityComponent,
    PortalAnnouncementsComponent,
    PortalApprovalsComponent,
    PortalAttendanceComponent,
    PortalHelpComponent,
    PortalKnowledgeComponent,
    PortalNotesComponent,
    PortalNotificationsComponent,
    PortalOrganizationComponent,
    PortalProfileComponent,
    PortalRecognitionComponent,
    PortalRemindersComponent,
    PortalSettingsComponent,
    PortalTeamComponent,
    PortalTimelineComponent,
    PortalRequestsIndexComponent,
    PortalRequestComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class PortalModule {}
