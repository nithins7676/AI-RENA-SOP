import { NextRequest, NextResponse } from 'next/server';
import { updateFileLastUsed } from '../../../utils/filesService';

export async function POST(request: NextRequest) {
  try {
    const { paths } = await request.json();
    
    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ error: 'Invalid paths' }, { status: 400 });
    }
    
    // Update last used date for each file
    for (const path of paths) {
      await updateFileLastUsed(path);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating file usage:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update file usage' }, 
      { status: 500 }
    );
  }
}