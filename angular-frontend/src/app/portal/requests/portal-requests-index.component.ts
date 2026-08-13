import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestsApiService } from '../services/requests.api.service';

@Component({
  selector: 'app-portal-requests-index',
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Requests</h2>
        <a routerLink="/portal/requests/new" class="text-sm text-blue-600">New request</a>
      </div>

      <app-table-adapter [rows]="(requests$ | async) || []"></app-table-adapter>
    </div>
  `
})
export class PortalRequestsIndexComponent {
  requests$: Observable<any[] | null>;
  constructor(private api: RequestsApiService) {
    this.requests$ = this.api.loadAll();
  }
}
