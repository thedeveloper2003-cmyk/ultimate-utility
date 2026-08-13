import { Component } from '@angular/core';

@Component({
  selector: 'app-portal-meetings-index',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Meetings</h3>
      <ul class="space-y-2">
        <li *ngFor="let m of meetings" class="p-2 bg-white border rounded">
          <a [routerLink]="['/portal/meetings', m.id]" class="text-blue-600">{{ m.title }}</a>
        </li>
      </ul>
    </div>
  `
})
export class PortalMeetingsIndexComponent {
  meetings = [
    { id: 'm1', title: 'All Hands' },
    { id: 'm2', title: 'Project Sync' }
  ];
}
