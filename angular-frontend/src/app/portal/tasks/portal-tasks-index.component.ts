import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TasksApiService } from '../services/tasks.api.service';

@Component({
  selector: 'app-portal-tasks-index',
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Tasks</h2>
        <a routerLink="/portal/tasks/new" class="text-sm text-blue-600">New task</a>
      </div>

      <app-table-adapter [rows]="(tasks$ | async) || []"></app-table-adapter>
    </div>
  `
})
export class PortalTasksIndexComponent {
  tasks$: Observable<any[] | null>;
  constructor(private api: TasksApiService) {
    this.tasks$ = this.api.loadAll();
  }
}
