import { NextRequest, NextResponse } from 'next/server';
import { getAllFiles } from '../../../utils/filesService';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const files = await getAllFiles();

    interface FileData {
      originalName: string;
      path: string;
      type: string;
      size: number;
      uploadDate: Date | string;
    }
    
    // Transform files for client use with proper typing
    const transformedFiles = files.map((file: FileData) => ({
      name: file.originalName,
      path: file.path,
      type: file.type,
      size: file.size,
      uploadDate: file.uploadDate
    }));
    
    return NextResponse.json({ files: transformedFiles });
  } catch (error) {
    console.error('Error getting files:', error);
    return NextResponse.json({ error: 'Failed to get files' }, { status: 500 });
  }
}