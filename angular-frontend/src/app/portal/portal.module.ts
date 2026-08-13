import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PortalShellComponent } from './portal-shell/portal-shell.component';
import { PortalDashboardComponent } from './dashboard/portal-dashboard.component';
import { PortalTasksIndexComponent } from './tasks/portal-tasks-index.component';
import { PortalCalendarComponent } from './calendar/portal-calendar.component';

const routes: Routes = [
  { path: '', component: PortalShellComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: PortalDashboardComponent },
      { path: 'calendar', component: PortalCalendarComponent },
      { path: 'tasks', component: PortalTasksIndexComponent },
      { path: 'tasks/:taskId', component: PortalTasksIndexComponent },
    ] }
];

@NgModule({
  declarations: [PortalShellComponent, PortalDashboardComponent, PortalTasksIndexComponent, PortalCalendarComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class PortalModule {}
