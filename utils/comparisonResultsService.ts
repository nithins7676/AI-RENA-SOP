import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';


interface ComparisonItem {
  id: number;
  section: string;
  status: string;
  regulation: string;
  documentation: string;
  pdfUrl: string;
  guidelinesPdfUrl: string;
  sopPdfUrl: string;
  pageNumber: number;
  sopPageNumber: number;
  severity: string;
  comment: string;
  discrepancy_type?: string;
  content_location?: string;
  sourceFiles?: {
    sop: string;
    guideline: string;
  };
}

interface ComparisonResult {
  userId: string;
  sopPaths: string[];
  guidelinePaths: string[];
  results: ComparisonItem[];
  createdAt: Date;
}

/**
 * Save comparison results to MongoDB
 */
export async function saveComparisonResults(userId: string, sopPaths: string[], guidelinePaths: string[], results: ComparisonItem[]) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('comparisonResults');
    
    const document: ComparisonResult = {
      userId,
      sopPaths,
      guidelinePaths,
      results,
      createdAt: new Date(),
    };
    
    const result = await collection.insertOne(document);
    console.log(`Saved comparison results with ID: ${result.insertedId} for user ${userId}`);
    return result.insertedId;
  } catch (error) {
    console.error("Error saving comparison results:", error);
    throw error;
  }
}

/**
 * Get all comparison results for a user
 */
export async function getUserComparisonResults(userId: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('comparisonResults');
    
    return await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  } catch (error) {
    console.error("Error getting user comparison results:", error);
    return [];
  }
}

/**
 * Get a specific comparison result by ID
 */
export async function getComparisonResultById(resultId: string) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('comparisonResults');
    
    return await collection.findOne({ _id: new ObjectId(resultId) });
  } catch (error) {
    console.error("Error getting comparison result:", error);
    return null;
  }
}