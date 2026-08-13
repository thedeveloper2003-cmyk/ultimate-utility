import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MeetingsApiService } from '../services/meetings.api.service';

@Component({
  selector: 'app-portal-meetings-index',
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Meetings</h2>
        <a routerLink="/portal/meetings/new" class="text-sm text-blue-600">New meeting</a>
      </div>

      <app-table-adapter [rows]="(meetings$ | async) || []"></app-table-adapter>
    </div>
  `
})
export class PortalMeetingsIndexComponent {
  meetings$: Observable<any[] | null>;
  constructor(private api: MeetingsApiService) {
    this.meetings$ = this.api.loadAll();
  }
}
