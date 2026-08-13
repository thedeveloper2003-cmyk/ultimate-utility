import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-portal-project',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Project {{ projectId }}</h3>
      <p>Project detail placeholder for {{ projectId }}.</p>
    </div>
  `
})
export class PortalProjectComponent {
  projectId: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
  }
}
