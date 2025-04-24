import { connectToDatabase } from './mongodb';
import { GeminiFile } from '../models/geminiFile';
import { ObjectId } from 'mongodb';

/**
 * Save Gemini file reference to MongoDB
 */
export async function saveGeminiFile(data: {
  userId: string;
  fileId: string;
  geminiFileName: string;
  geminiDisplayName: string;
  status: GeminiFile['status'];
}): Promise<GeminiFile> {
  const { db } = await connectToDatabase();
  const collection = db.collection('geminiFiles');
  
  const now = new Date();
  const fileToInsert = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const result = await collection.insertOne(fileToInsert);
  
  return {
    ...fileToInsert,
    _id: result.insertedId.toString()
  } as GeminiFile;
}

/**
 * Check if file has already been uploaded to Gemini
 */
export async function getGeminiFileByOriginalFileId(fileId: string): Promise<GeminiFile | null> {
  const { db } = await connectToDatabase();
  const collection = db.collection('geminiFiles');
  
  const geminiFile = await collection.findOne({ 
    fileId, 
    status: 'active' // Only return active files
  });
  
  return geminiFile as GeminiFile | null;
}

/**
 * Update Gemini file status
 */
export async function updateGeminiFileStatus(
  id: string, 
  status: GeminiFile['status']
): Promise<boolean> {
  const { db } = await connectToDatabase();
  const collection = db.collection('geminiFiles');
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        status,
        updatedAt: new Date() 
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Get all Gemini files for a user
 */
export async function getGeminiFilesByUser(userId: string): Promise<GeminiFile[]> {
  const { db } = await connectToDatabase();
  const collection = db.collection('geminiFiles');
  
  const files = await collection.find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  
  return files as GeminiFile[];
}