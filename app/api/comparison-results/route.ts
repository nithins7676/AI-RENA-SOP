import { NextRequest, NextResponse } from 'next/server';
import { getCachedComparisonResult } from '../../../utils/documentsComparisonService';
import { getUserComparisonResults, getComparisonResultById } from '../../../utils/comparisonResultsService';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie or authentication system
    const userIdCookie = request.cookies.get('userId');
    const userId = userIdCookie?.value;
    
    // Get result ID from URL if provided
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get('id');
    
    // If result ID is provided, get that specific result
    if (resultId) {
      const result = await getComparisonResultById(resultId);
      if (!result) {
        return NextResponse.json({ error: 'Result not found' }, { status: 404 });
      }
      return NextResponse.json(result.results);
    }
    
    // If user ID is provided, get all results for that user
    if (userId) {
      const results = await getUserComparisonResults(userId);
      if (results.length > 0) {
        // Return the most recent comparison by default
        return NextResponse.json(results[0].results);
      }
    }
    
    // Fallback to global cache if no user ID or no results in DB
    const cachedResults = getCachedComparisonResult();
    
    if (!cachedResults) {
      console.log("API: No comparison results found, returning empty array");
      return NextResponse.json([]);
    }
    
    return NextResponse.json(cachedResults);
  } catch (error: unknown) {
    console.error('Error getting comparison results:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error retrieving comparison results';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}