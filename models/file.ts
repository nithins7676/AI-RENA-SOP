export interface FileDocument {
    originalName: string;    // Original filename
    path: string;            // Path in public folder
    type: 'sop' | 'guideline';
    size: number;            // File size in bytes
    uploadDate: Date;        // When uploaded
    contentHash: string;     // Hash for duplicate detection
    lastUsedDate?: Date;     // When last used in comparison
  }