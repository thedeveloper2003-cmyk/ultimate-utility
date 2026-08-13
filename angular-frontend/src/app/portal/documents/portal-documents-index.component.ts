import { Component } from '@angular/core';

@Component({
  selector: 'app-portal-documents-index',
  template: `
    <div>
      <h3 class="text-2xl font-bold mb-4">Documents</h3>
      <ul class="space-y-2">
        <li *ngFor="let d of documents" class="p-2 bg-white border rounded">
          <a [routerLink]="['/portal/documents', d.id]" class="text-blue-600">{{ d.title }}</a>
        </li>
      </ul>
    </div>
  `
})
export class PortalDocumentsIndexComponent {
  documents = [
    { id: 'doc-1', title: 'Project Plan' },
    { id: 'doc-2', title: 'Roadmap' }
  ];
}
