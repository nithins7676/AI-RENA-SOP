import { User } from './user';
import { FileDocument } from './file';

export interface GeminiFile {
  _id?: string;
  userId: string;            // Reference to the User._id
  fileId: string;            // Reference to the FileDocument._id (optional if you want to link to existing files)
  geminiFileName: string;    // The name returned by Gemini API (file.name)
  geminiDisplayName: string; // The display name in Gemini
  status: 'processing' | 'active' | 'failed';  // Status from Gemini
  createdAt: Date;
  updatedAt: Date;
}