export enum DocumentVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PROJECT = 'project',
  ORGANIZATION = 'organization'
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: string;
  visibility: DocumentVisibility | string;
  projectId?: string | null;
  taskId?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  latestVersionId?: string | null;
  tags?: string[];
  status?: 'active' | 'archived' | string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  fileName: string;
  mimeType: string;
  size: number;
  checksum?: string;
  storageUrl?: string;
  createdBy: string;
  createdAt: string;
  notes?: string;
  isPreviewAvailable?: boolean;
  previewBase64?: string | null; // base64 preview data for small files (images, PDFs)
}
