import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentsApiService } from '../services/documents.api.service';

@Component({
  selector: 'app-portal-documents-index',
  template: `
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Documents</h2>
        <a routerLink="/portal/documents/new" class="text-sm text-blue-600">Upload</a>
      </div>

      <app-table-adapter [rows]="(docs$ | async) || []"></app-table-adapter>
    </div>
  `
})
export class PortalDocumentsIndexComponent {
  docs$: Observable<any[] | null>;
  constructor(private api: DocumentsApiService) {
    this.docs$ = this.api.loadAll();
  }
}
