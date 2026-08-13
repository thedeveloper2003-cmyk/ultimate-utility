import { Component } from '@angular/core';

@Component({
  selector: 'app-portal-projects-index',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Projects</h3>
      <ul class="space-y-2">
        <li *ngFor="let p of projects" class="p-2 bg-white border rounded">
          <a [routerLink]="['/portal/projects', p.id]" class="text-blue-600">{{ p.title }}</a>
        </li>
      </ul>
    </div>
  `
})
export class PortalProjectsIndexComponent {
  projects = [
    { id: 'proj-1', title: 'New Website' },
    { id: 'proj-2', title: 'Mobile App' }
  ];
}
