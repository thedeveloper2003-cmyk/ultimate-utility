import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-portal-document',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Document {{ documentId }}</h3>
      <p>Document content placeholder for {{ documentId }}.</p>
    </div>
  `
})
export class PortalDocumentComponent {
  documentId: string | null = null;
  constructor(private route: ActivatedRoute) {
    this.documentId = this.route.snapshot.paramMap.get('documentId');
  }
}
