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

const routes: Routes = [
  { path: '', component: PortalShellComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PortalDashboardComponent },
      { path: 'calendar', component: PortalCalendarComponent },
      { path: 'tasks', component: PortalTasksIndexComponent },
      { path: 'tasks/:taskId', component: PortalTasksIndexComponent },
      { path: 'meetings', component: PortalMeetingsIndexComponent },
      { path: 'meetings/:meetingId', component: PortalMeetingComponent },
      { path: 'documents', component: PortalDocumentsIndexComponent },
      { path: 'documents/:documentId', component: PortalDocumentComponent },
      { path: 'projects', component: PortalProjectsIndexComponent },
      { path: 'projects/:projectId', component: PortalProjectComponent }
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
    PortalProjectComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class PortalModule {}
