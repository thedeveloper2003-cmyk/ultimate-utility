import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentsApiService } from '../services/documents.api.service';

@Component({
  selector: 'app-portal-document',
  template: `
    <div class="p-4 max-w-2xl">
      <div class="mb-4">
        <h2 class="text-xl font-semibold">Document</h2>
      </div>

      <div *ngIf="doc">
        <p class="font-medium">{{ doc.title }}</p>
        <p class="text-xs text-muted-foreground">Updated: {{ doc.updatedAt }}</p>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium">Upload new (placeholder)</label>
        <input type="file" (change)="onFile($event)" class="mt-1" />
        <div *ngIf="selectedFile" class="mt-2 text-sm">Selected: {{ selectedFile }}</div>
      </div>

      <div class="mt-4">
        <button class="px-3 py-1 bg-blue-600 text-white rounded" (click)="save()">Save</button>
        <button class="px-3 py-1 bg-gray-200 rounded ml-2" (click)="cancel()">Cancel</button>
      </div>
    </div>
  `
})
export class PortalDocumentComponent implements OnInit {
  doc: any = null;
  selectedFile: string | null = null;
  constructor(private route: ActivatedRoute, private api: DocumentsApiService, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('documentId');
    if (id && id !== 'new') {
      this.api.getById(id).subscribe((d) => (this.doc = d));
    }
  }

  onFile(e: any) {
    const f = e.target.files && e.target.files[0];
    if (f) this.selectedFile = f.name;
  }

  save() {
    // stub: no upload performed. Navigate back.
    this.router.navigate(['/portal/documents']);
  }

  cancel() { this.router.navigate(['/portal/documents']); }
}
