import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectsApiService } from '../services/projects.api.service';

@Component({
  selector: 'app-portal-projects-index',
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Projects</h2>
        <a routerLink="/portal/projects/new" class="text-sm text-blue-600">New project</a>
      </div>

      <app-table-adapter [rows]="(projects$ | async) || []"></app-table-adapter>
    </div>
  `
})
export class PortalProjectsIndexComponent {
  projects$: Observable<any[] | null>;
  constructor(private api: ProjectsApiService) {
    this.projects$ = this.api.loadAll();
  }
}
