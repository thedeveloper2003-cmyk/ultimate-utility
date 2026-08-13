import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-portal-meeting',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Meeting {{ meetingId }}</h3>
      <p>Details for meeting {{ meetingId }} (placeholder).</p>
    </div>
  `
})
export class PortalMeetingComponent {
  meetingId: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.meetingId = this.route.snapshot.paramMap.get('meetingId');
  }
}
