# Document Upload Format & Metadata Specification

This document defines the standard file format and metadata structure for all uploaded documents used by the Employee Portal mock-data system.

Purpose
- Provide a single canonical metadata shape for documents and their versions.
- Ensure cross-module integration (documents ↔ projects ↔ tasks ↔ notifications ↔ audit).
- Make mock JSON files deterministic and easy to seed and update.

Principles
- Metadata is separate from file content. Files are referenced by metadata URLs and version entries.
- All timestamps are ISO 8601 strings (UTC) internally; UI layers convert to localized display.
- Versioning is mandatory: every document has one or more DocumentVersion entries.
- Use stable IDs (string IDs) prefixed by type: `doc-`, `ver-`, `proj-`, `task-`, `emp-`.
- Use MIME type and file size for validation.
- Keep mock storage as immutable seeds; runtime changes happen in service-level BehaviorSubjects and optionally persisted to localStorage.

Top-level JSON files (seed data)
- src/assets/mock-data/documents.json — list of Document records (metadata + pointer to latestVersionId)
- src/assets/mock-data/document-versions.json — list of DocumentVersion records

TypeScript interfaces (canonical)
- Document
- DocumentVersion

Document schema (Document)
- id: string — unique id `doc-<timestamp|uuid>`
- title: string — human-friendly title
- description?: string
- category: string — e.g., "Project Document", "Policy", "Template", "My Document"
- visibility: "private" | "team" | "project" | "organization" (see enum)
- projectId?: string
- taskId?: string
- ownerId: string — employeeId who uploaded
- createdAt: string (ISO)
- updatedAt: string (ISO)
- latestVersionId: string — id of latest DocumentVersion
- tags?: string[]
- attachments?: Array<{ name: string; size: number; mime: string }>
- permissions?: { view: string[]; edit: string[] } — optional employeeId arrays or role ids
- status?: string — (active, archived)

DocumentVersion schema (DocumentVersion)
- id: string — `ver-<timestamp|uuid>`
- documentId: string — the parent document id
- versionNumber: number — 1,2,3...
- fileName: string
- mimeType: string
- size: number — bytes
- checksum?: string — optional checksum (sha256 hex)
- storageUrl?: string — URL to mock preview or download; can be /assets/mock-files/... or data URL
- createdBy: string (employeeId)
- createdAt: string (ISO)
- notes?: string — change note
- isPreviewAvailable?: boolean

Validation rules (client-side)
- Allowed mime types: configure in UI (defaults below)
  - application/pdf
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
  - application/vnd.ms-excel
  - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  - image/png
  - image/jpeg
  - text/plain
  - application/zip
- Max file size: configurable (default 10 MB = 10 * 1024 * 1024 bytes)
- File name: sanitized (remove control chars, limit length 250)

Runtime behavior
- Upload flow (mock): user chooses file → UI validates → DocumentsApiService.create(payload, file?) is called
- In mock mode (no environment.apiUrl): the service will create a Document record and DocumentVersion record, store in in-memory BehaviorSubject, and (optionally) persist to localStorage.
- On create: versionNumber = previousLatestVersionNumber + 1 (or 1 if none), latestVersionId updated on Document.
- Deleting a document updates in-memory store and audit logs.
- Updating (metadata only) retains version history unless file replaced.
- Replacing file calls create a new DocumentVersion and increments versionNumber.

Cross-module integration
- Task ↔ Document: `taskId` on Document links a document to a task.
- Project ↔ Document: `projectId` on Document links to a project.
- Notification: when a document is uploaded or updated, a Notification object should be generated with entityType: "document" and entityId = document.id.
- Activity/Audit: every create/update/delete generates activity and audit records.

Mock storage recommendations
- Seed JSON files remain read-only initial state.
- At runtime, services load seed data once and maintain BehaviorSubjects for mutation.
- Persist runtime changes to localStorage (key prefix `mock_documents_v1`) so page refresh preserves changes.

Example document JSON (documents.json)
```json
[
  {
    "id": "doc-1001",
    "title": "Project Phoenix - Requirements",
    "description": "Requirements document for Project Phoenix",
    "category": "Project Document",
    "visibility": "project",
    "projectId": "proj-1",
    "ownerId": "emp-1",
    "createdAt": "2026-02-01T09:15:00Z",
    "updatedAt": "2026-02-03T10:20:00Z",
    "latestVersionId": "ver-2001",
    "tags": ["requirements","project-phoenix"],
    "status": "active"
  }
]
```

Example document versions JSON (document-versions.json)
```json
[
  {
    "id": "ver-2001",
    "documentId": "doc-1001",
    "versionNumber": 2,
    "fileName": "Project-Phoenix-Requirements-v2.pdf",
    "mimeType": "application/pdf",
    "size": 234567,
    "checksum": "e3b0c44298fc1c149afbf4c8996fb924",
    "storageUrl": "/assets/mock-files/Project-Phoenix-Requirements-v2.pdf",
    "createdBy": "emp-1",
    "createdAt": "2026-02-03T10:20:00Z",
    "notes": "Updated scope section"
  }
]
```

API service contract (DocumentsApiService)
- loadAll(): Observable<Document[]>
- getById(id: string): Observable<Document | null>
- loadVersions(documentId: string): Observable<DocumentVersion[]>
- getVersion(documentId: string, versionId: string): Observable<DocumentVersion | null>
- create(documentMetadata, file?): Observable<Document>
- update(documentId, metadata): Observable<Document>
- uploadVersion(documentId, file, notes?): Observable<DocumentVersion>
- delete(documentId): Observable<{ success: boolean }>
- downloadVersion(versionId): Observable<Blob | string> — in mock mode returns storageUrl or base64 data

Security & sanitization
- Sanitize filenames
- Validate mime types and sizes
- Strip dangerous file extensions in preview pipelines
- For mock previews, avoid executing any HTML content; treat as download only

UI considerations
- Document list: show title, category, owner, updatedAt, size (latest), versionNumber (latest), actions (preview, download, edit metadata, upload new version, history)
- Document detail: show metadata, current version preview link, version list (with diff notes), related entities (project/task)
- Upload dialog: file input, title, description, category, visibility, related project/task, tags, notes
- Version history: show entries with createdAt, createdBy, fileName, size, notes, download link
- Empty states: contextual message like "No documents found for this project. Upload one to get started."
- Accessibility: inputs have labels, file input accessible, keyboard focus states

Unit tests to add
- DocumentsApiService stub: create/update/delete/uploadVersion increments versionNumber and updates latestVersionId
- UI components: document-list renders rows, document-detail shows versions
- File validation: rejects files over max size, rejects disallowed mime types

Migration notes
- Add `src/assets/mock-data/documents.json` and `document-versions.json` as seed data.
- Update DocumentsApiService to load seeds on initialization and persist runtime changes to localStorage.
- Ensure other services (NotificationsService, ActivityService, ProjectsService) subscribe to document events or DocumentsApiService BehaviorSubjects to generate cross-module updates.

Maintenance
- Increase schema version when changing metadata schema; persist to localStorage under schema-aware key.

-- End of specification --
