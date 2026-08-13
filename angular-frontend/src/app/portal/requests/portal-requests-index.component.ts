import { Component } from '@angular/core';

@Component({
  selector: 'app-portal-requests-index',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Requests</h3>
      <ul class="space-y-2">
        <li *ngFor="let r of requests" class="p-2 bg-white border rounded">
          <a [routerLink]="['/portal/requests', r.id]" class="text-blue-600">{{ r.title }}</a>
        </li>
      </ul>
    </div>
  `
})
export class PortalRequestsIndexComponent {
  requests = [
    { id: 'req-1', title: 'Time Off' },
    { id: 'req-2', title: 'Equipment' }
  ];
}
