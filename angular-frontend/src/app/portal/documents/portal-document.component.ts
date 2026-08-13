import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentsApiService } from '../services/documents.api.service';
import { DocumentVersion } from '../models/document.model';

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

      <div class="mt-4" *ngIf="versions?.length">
        <h3 class="font-semibold">Version history</h3>
        <ul class="space-y-2 mt-2">
          <li *ngFor="let v of versions" class="p-2 border rounded flex items-start gap-3">
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium">{{ v.fileName }} <span class="text-xs text-muted-foreground">v{{ v.versionNumber }}</span></div>
                  <div class="text-xs text-muted-foreground">Uploaded: {{ v.createdAt }} by {{ v.createdBy }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <button class="px-2 py-1 bg-gray-100 rounded" (click)="download(v)">Download</button>
                  <button *ngIf="v.isPreviewAvailable" class="px-2 py-1 bg-blue-600 text-white rounded" (click)="preview(v)">Preview</button>
                </div>
              </div>
              <p class="text-sm text-muted-foreground mt-1">{{ v.notes }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div *ngIf="previewData" class="mt-4">
        <h4 class="font-semibold">Preview</h4>
        <div class="mt-2">
          <img *ngIf="previewMime?.startsWith('image/')" [src]="previewData" alt="preview" class="max-w-full border rounded" />
          <iframe *ngIf="previewMime === 'application/pdf'" [src]="previewData" class="w-full h-80 border"></iframe>
          <div *ngIf="!previewMime">Preview not available</div>
        </div>
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
  selectedFileObj: File | null = null;
  versions: DocumentVersion[] = [];
  previewData: string | null = null; // data URL
  previewMime: string | null = null;

  constructor(private route: ActivatedRoute, private api: DocumentsApiService, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('documentId');
    if (id && id !== 'new') {
      this.api.getById(id).subscribe((d) => (this.doc = d));
      this.api.loadVersions(id).subscribe((v) => (this.versions = v || []));
    }
  }

  onFile(e: any) {
    const f: File | undefined = e.target.files && e.target.files[0];
    if (f) {
      this.selectedFile = f.name;
      this.selectedFileObj = f;
      // generate immediate preview for images/pdf if allowed
      if ((f.size <= 1 * 1024 * 1024) && (f.type === 'application/pdf' || f.type.startsWith('image/'))) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewData = reader.result as string;
          this.previewMime = f.type;
        };
        reader.readAsDataURL(f);
      }
    }
  }

  save() {
    const payload: any = { title: this.doc?.title || 'New document', updatedAt: new Date().toISOString() };
    const id = this.route.snapshot.paramMap.get('documentId');
    if (id && id !== 'new') {
      if (this.selectedFileObj) {
        this.api.uploadVersion(id, this.selectedFileObj, 'Uploaded new version').subscribe(() => this.router.navigate(['/portal/documents']));
      } else {
        this.api.update(id, payload).subscribe(() => this.router.navigate(['/portal/documents']));
      }
    } else {
      // create new document; include file if present
      this.api.create({ title: payload.title, ownerId: 'emp-unknown' }, this.selectedFileObj || undefined).subscribe(() => this.router.navigate(['/portal/documents']));
    }
  }

  cancel() { this.router.navigate(['/portal/documents']); }

  download(v: DocumentVersion) {
    // in mock mode, storageUrl or previewBase64 may be returned
    this.api.downloadVersion(v.id).subscribe((res) => {
      if (!res) return;
      if (res.startsWith('data:')) {
        // open in new tab
        const w = window.open();
        if (w) w.document.write(`<iframe src="${res}" style="border:0; width:100%; height:100%"></iframe>`);
      } else {
        // storageUrl - open directly
        window.open(res, '_blank');
      }
    });
  }

  preview(v: DocumentVersion) {
    if (v.previewBase64) {
      this.previewData = v.previewBase64;
      this.previewMime = v.mimeType;
    } else if (v.storageUrl) {
      // try to use storageUrl
      if (v.mimeType === 'application/pdf') {
        const url = v.storageUrl;
        this.previewData = url;
        this.previewMime = v.mimeType;
      } else {
        this.previewData = v.storageUrl;
        this.previewMime = v.mimeType;
      }
    }
  }
}
