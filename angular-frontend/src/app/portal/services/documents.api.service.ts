import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Document, DocumentVersion } from '../models/document.model';
import { map, switchMap } from 'rxjs/operators';

const PREVIEW_MAX_BYTES = 1 * 1024 * 1024; // 1 MB
const PREVIEW_MIME_WHITELIST = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf'
];

// localStorage persistence
const STORAGE_KEY = 'mock_documents_v1';
const STORAGE_SCHEMA_VERSION = 1;

interface PersistedDocuments {
  schemaVersion: number;
  docs: Document[];
  versions: DocumentVersion[];
  persistedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentsApiService {
  private docs$ = new BehaviorSubject<Document[] | null>(null);
  private versions$ = new BehaviorSubject<DocumentVersion[] | null>(null);
  private seedsLoaded = false;

  constructor(private http: HttpClient) {}

  // Initialize seed data for docs and versions if not yet populated
  private ensureSeedsLoaded(): void {
    if (this.seedsLoaded) return;

    // 1. Try load from localStorage first
    const persisted = this.loadFromStorage();
    if (persisted) {
      this.docs$.next(persisted.docs || []);
      this.versions$.next(persisted.versions || []);
      // Attempt to regenerate previews for persisted versions that lack them
      (persisted.versions || []).forEach((ver) => this.maybeGeneratePreviewForVersion(ver));
      this.seedsLoaded = true;
      return;
    }

    // 2. Fallback to seed JSON assets
    this.http.get<Document[]>('/assets/mock-data/documents.json').subscribe(
      (d) => {
        this.docs$.next(d || []);
        // persist initial seed to localStorage for future runtime persistence
        this.persistToStorage(d || [], this.versions$.value || []);
      },
      () => this.docs$.next([]),
    );

    this.http.get<DocumentVersion[]>('/assets/mock-data/document-versions.json').subscribe(
      (v) => {
        (v || []).forEach((ver) => { ver.isPreviewAvailable = false; ver.previewBase64 = null; });
        this.versions$.next(v || []);
        // for each version eligible, kick off async preview generation
        (v || []).forEach((ver) => this.maybeGeneratePreviewForVersion(ver));
        // persist initial seed
        this.persistToStorage(this.docs$.value || [], v || []);
      },
      () => this.versions$.next([]),
    );

    this.seedsLoaded = true;
  }

  // Persistence helpers
  private loadFromStorage(): PersistedDocuments | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedDocuments;
      if (!parsed || typeof parsed.schemaVersion !== 'number') return null;
      // migration hook (if future versions need changes)
      if (parsed.schemaVersion !== STORAGE_SCHEMA_VERSION) {
        const migrated = this.migrateStorage(parsed);
        this.persistToStorage(migrated.docs, migrated.versions);
        return migrated;
      }
      return parsed;
    } catch (e) {
      console.warn('Failed to parse persisted documents:', e);
      return null;
    }
  }

  private migrateStorage(old: PersistedDocuments): PersistedDocuments {
    // Simple migration scaffold: currently only schemaVersion 1 exists.
    // If older versions appear, transform them here.
    // For now, drop-through and upgrade version number.
    console.info('Migrating persisted mock documents from schema', old.schemaVersion, 'to', STORAGE_SCHEMA_VERSION);
    const migrated: PersistedDocuments = {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      docs: old.docs || [],
      versions: old.versions || [],
      persistedAt: new Date().toISOString()
    };
    return migrated;
  }

  private persistToStorage(docs: Document[], versions: DocumentVersion[]) {
    try {
      const payload: PersistedDocuments = { schemaVersion: STORAGE_SCHEMA_VERSION, docs, versions, persistedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist mock documents to localStorage:', e);
    }
  }

  // Public API
  loadAll(): Observable<Document[] | null> {
    this.ensureSeedsLoaded();
    return this.docs$.asObservable();
  }

  getById(id: string): Observable<Document | null> {
    this.ensureSeedsLoaded();
    return this.docs$.pipe(map((docs) => (docs || []).find((d) => d.id === id) || null));
  }

  loadVersions(documentId: string): Observable<DocumentVersion[] | null> {
    this.ensureSeedsLoaded();
    return this.versions$.pipe(map((vers) => (vers || []).filter((v) => v.documentId === documentId)));
  }

  getVersion(documentId: string, versionId: string): Observable<DocumentVersion | null> {
    this.ensureSeedsLoaded();
    return this.versions$.pipe(map((vers) => (vers || []).find((v) => v.documentId === documentId && v.id === versionId) || null));
  }

  create(payload: Partial<Document>, file?: File): Observable<Document> {
    if (!environment.apiUrl) {
      this.ensureSeedsLoaded();
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        title: payload.title || 'Untitled Document',
        description: payload.description || '',
        category: payload.category || 'General',
        visibility: payload.visibility || 'private',
        projectId: payload.projectId || null,
        taskId: payload.taskId || null,
        ownerId: payload.ownerId || 'emp-unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        latestVersionId: null,
        tags: payload.tags || [],
        status: payload.status || 'active'
      };
      const docs = this.docs$.value || [];
      this.docs$.next([...docs, newDoc]);

      if (file) {
        // create initial version
        const ver = this.createVersionRecord(newDoc.id, file, newDoc.ownerId);
        this.addVersion(ver);
        newDoc.latestVersionId = ver.id;
        newDoc.updatedAt = ver.createdAt;
        this.emitDocsUpdate(newDoc);
        // generate preview from the uploaded file
        this.generatePreviewFromFile(file, ver);
      }

      // persist after mutation
      this.persistToStorage(this.docs$.value || [], this.versions$.value || []);

      return of(newDoc);
    }
    return this.http.post<Document>(`${environment.apiUrl}/documents`, payload);
  }

  update(id: string, payload: Partial<Document>): Observable<Document> {
    if (!environment.apiUrl) {
      this.ensureSeedsLoaded();
      const docs = this.docs$.value || [];
      const updatedDocs = docs.map((d) => (d.id === id ? { ...d, ...payload, updatedAt: new Date().toISOString() } : d));
      this.docs$.next(updatedDocs);
      const updated = updatedDocs.find((d) => d.id === id)!;
      // persist
      this.persistToStorage(this.docs$.value || [], this.versions$.value || []);
      return of(updated);
    }
    return this.http.put<Document>(`${environment.apiUrl}/documents/${id}`, payload);
  }

  uploadVersion(documentId: string, file: File, notes?: string): Observable<DocumentVersion> {
    if (!environment.apiUrl) {
      this.ensureSeedsLoaded();
      const ownerId = 'emp-unknown';
      const ver = this.createVersionRecord(documentId, file, ownerId, notes);
      this.addVersion(ver);
      // update document latestVersionId
      const docs = this.docs$.value || [];
      const updatedDocs = docs.map((d) => (d.id === documentId ? { ...d, latestVersionId: ver.id, updatedAt: ver.createdAt } : d));
      this.docs$.next(updatedDocs);
      // generate preview for uploaded file
      this.generatePreviewFromFile(file, ver);
      // persist
      this.persistToStorage(this.docs$.value || [], this.versions$.value || []);
      return of(ver);
    }
    // real API would be a multipart/form-data upload
    const form = new FormData();
    form.append('file', file);
    if (notes) form.append('notes', notes);
    return this.http.post<DocumentVersion>(`${environment.apiUrl}/documents/${documentId}/versions`, form);
  }

  delete(id: string): Observable<any> {
    if (!environment.apiUrl) {
      this.ensureSeedsLoaded();
      this.docs$.next((this.docs$.value || []).filter((d) => d.id !== id));
      // also remove versions
      this.versions$.next((this.versions$.value || []).filter((v) => v.documentId !== id));
      // persist
      this.persistToStorage(this.docs$.value || [], this.versions$.value || []);
      return of({ success: true });
    }
    return this.http.delete<any>(`${environment.apiUrl}/documents/${id}`);
  }

  // Download version (mock returns storageUrl or base64 string)
  downloadVersion(versionId: string): Observable<string | null> {
    this.ensureSeedsLoaded();
    const v = (this.versions$.value || []).find((x) => x.id === versionId);
    if (!v) return of(null);
    if (v.previewBase64) return of(v.previewBase64);
    if (v.storageUrl) return of(v.storageUrl);
    return of(null);
  }

  // Helpers
  private createVersionRecord(documentId: string, file: File, createdBy: string, notes?: string): DocumentVersion {
    const id = `ver-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const ver: DocumentVersion = {
      id,
      documentId,
      versionNumber: (this.getLatestVersionNumber(documentId) || 0) + 1,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      checksum: undefined,
      storageUrl: undefined,
      createdBy,
      createdAt,
      notes: notes || '',
      isPreviewAvailable: false,
      previewBase64: null
    };
    return ver;
  }

  private addVersion(ver: DocumentVersion) {
    const arr = this.versions$.value || [];
    this.versions$.next([...arr, ver]);
    // try to generate preview for the version (if storageUrl exists or mime/size allow)
    this.maybeGeneratePreviewForVersion(ver);
  }

  private getLatestVersionNumber(documentId: string): number | null {
    const vers = this.versions$.value || [];
    const docVers = vers.filter((v) => v.documentId === documentId);
    if (!docVers.length) return null;
    return Math.max(...docVers.map((v) => v.versionNumber || 1));
  }

  private emitDocsUpdate(updatedDoc: Document) {
    const docs = this.docs$.value || [];
    const next = docs.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
    this.docs$.next(next);
  }

  private maybeGeneratePreviewForVersion(ver: DocumentVersion) {
    // if preview already available, skip
    if (ver.previewBase64) return;
    // If we have a storageUrl and it's an asset (startsWith '/assets'), try to fetch and convert
    if (ver.storageUrl && PREVIEW_MIME_WHITELIST.includes(ver.mimeType)) {
      // fetch blob and convert
      this.http.get(ver.storageUrl, { responseType: 'blob' }).pipe(
        switchMap((blob) => from(this.blobToBase64(blob).then((b64) => ({ blob, b64 })) ))
      ).subscribe({
        next: ({ b64 }) => {
          ver.previewBase64 = `data:${ver.mimeType};base64,${b64}`;
          ver.isPreviewAvailable = true;
          this.updateVersion(ver);
          // persist
          this.persistToStorage(this.docs$.value || [], this.versions$.value || []);
        },
        error: () => {
          // ignore preview failure
        }
      });
      return;
    }
    // No storageUrl; preview may be created later when file uploaded (we need file object to convert)
  }

  private generatePreviewFromFile(file: File, ver: DocumentVersion) {
    if (!PREVIEW_MIME_WHITELIST.includes(ver.mimeType) || ver.size > PREVIEW_MAX_BYTES) {
      return;
    }
    this.fileToBase64(file).then((b64) => {
      ver.previewBase64 = `data:${ver.mimeType};base64,${b64}`;
      ver.isPreviewAvailable = true;
      // Optionally set storageUrl to data URL for download
      ver.storageUrl = ver.previewBase64;
      this.updateVersion(ver);
      // persist
      this.persistToStorage(this.docs$.value || [], this.versions$.value || []);
    }).catch(() => {
      // ignore errors
    });
  }

  private updateVersion(ver: DocumentVersion) {
    const arr = this.versions$.value || [];
    const updated = arr.map((v) => (v.id === ver.id ? ver : v));
    this.versions$.next(updated);
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const idx = dataUrl.indexOf(',');
        if (idx >= 0) resolve(dataUrl.slice(idx + 1));
        else resolve('');
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(blob);
    });
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const idx = dataUrl.indexOf(',');
        if (idx >= 0) resolve(dataUrl.slice(idx + 1));
        else resolve('');
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}
