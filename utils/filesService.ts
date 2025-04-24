import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { connectToDatabase } from './mongodb';

/**
 * Calculate hash of file contents for duplicate detection
 */
function calculateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

/**
 * Save file metadata to MongoDB
 */
export async function saveFileMetadata(fileData: {
  originalName: string;
  path: string;
  type: 'sop' | 'guidelines';
  size: number;
  uploadDate: Date;
  filePath: string;
}) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('files');

    // Calculate content hash for duplicate detection
    const contentHash = calculateFileHash(fileData.filePath);

    // Check if file with same hash exists
    const existingFile = await collection.findOne({ contentHash });
    
    if (existingFile) {
      console.log(`File with hash ${contentHash} already exists in database`);
      return existingFile;
    }

    // Otherwise create new entry
    const fileDocument = {
      originalName: fileData.originalName,
      path: fileData.path,
      type: fileData.type,
      size: fileData.size,
      uploadDate: fileData.uploadDate,
      contentHash,
      lastUsedDate: null
    };

    await collection.insertOne(fileDocument);
    return fileDocument;
  } catch (error) {
    console.error("Error saving file metadata:", error);
    // Return basic file info without MongoDB integration if there's an error
    return {
      originalName: fileData.originalName,
      path: fileData.path,
      type: fileData.type,
      size: fileData.size
    };
  }
}

/**
 * Get all files metadata from MongoDB
 */
export async function getAllFiles() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('files');
    
    return await collection.find().sort({ uploadDate: -1 }).toArray();
  } catch (error) {
    console.error("Error getting all files:", error);
    return [];
  }
}

/**
 * Update file's last used date
 */
export async function updateFileLastUsed(path: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('files');
    
    await collection.updateOne(
      { path },
      { $set: { lastUsedDate: new Date() } }
    );
  } catch (error) {
    console.error("Error updating file last used date:", error);
  }
}