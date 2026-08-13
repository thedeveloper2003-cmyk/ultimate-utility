import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-portal-request',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Request {{ requestId }}</h3>
      <p>Request detail placeholder for {{ requestId }}.</p>
    </div>
  `
})
export class PortalRequestComponent {
  requestId: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.requestId = this.route.snapshot.paramMap.get('requestId');
  }
}
