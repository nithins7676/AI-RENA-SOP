import { NextRequest, NextResponse } from 'next/server';
import { compareMultipleDocuments } from '../../../utils/documentsComparisonService';
import { saveComparisonResults } from '../../../utils/comparisonResultsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sopPaths, guidelinePaths } = body;
    
    // Get user ID from cookies
    const userIdCookie = request.cookies.get('userId');
    const userId = userIdCookie?.value;
    
    if (!sopPaths?.length || !guidelinePaths?.length) {
      return NextResponse.json({
        error: 'Missing required paths'
      }, { status: 400 });
    }
    
    console.log(`API: Comparing ${sopPaths.length} SOPs with ${guidelinePaths.length} guidelines`);
    
    // Use the document comparison function
    const result = await compareMultipleDocuments(sopPaths, guidelinePaths);
    
    // Store the results in global cache for backward compatibility
    global.comparisonCache = result;
    
    // If we have a user ID and results are valid (not an error), save to MongoDB
    if (userId && Array.isArray(result)) {
      try {
        const resultId = await saveComparisonResults(userId, sopPaths, guidelinePaths, result);
        
        return NextResponse.json({
          success: true,
          resultId: resultId.toString(),
          count: result.length
        });
      } catch (dbError) {
        console.error("Failed to save comparison results to database:", dbError);
        // Still return results even if DB save fails
        return NextResponse.json(result);
      }
    }
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Comparison API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error during comparison'
    }, { status: 500 });
  }
}