import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface FileInfo {
  name: string;
  path: string;
  type: 'sop' | 'guideline';
  size: number;
  lastModified: number;
}

/**
 * GET endpoint to list all available PDF documents
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const files: FileInfo[] = [];
    const contentDir = path.join(process.cwd(), 'public', 'content');

    // Check if content directory exists
    if (!fs.existsSync(contentDir)) {
      return NextResponse.json({ files: [] });
    }

    // Read SOP files
    const sopDir = path.join(contentDir, 'sop');
    if (fs.existsSync(sopDir)) {
      const sopFiles = fs.readdirSync(sopDir)
        .filter(file => file.toLowerCase().endsWith('.pdf'));
      
      for (const file of sopFiles) {
        const filePath = path.join(sopDir, file);
        const stats = fs.statSync(filePath);
        files.push({
          name: file,
          path: `/content/sop/${file}`,
          type: 'sop',
          size: stats.size,
          lastModified: stats.mtimeMs
        });
      }
    }

    // Read Guideline files
    const guidelineDir = path.join(contentDir, 'guidelines');
    if (fs.existsSync(guidelineDir)) {
      const guidelineFiles = fs.readdirSync(guidelineDir)
        .filter(file => file.toLowerCase().endsWith('.pdf'));
      
      for (const file of guidelineFiles) {
        const filePath = path.join(guidelineDir, file);
        const stats = fs.statSync(filePath);
        files.push({
          name: file,
          path: `/content/guidelines/${file}`,
          type: 'guideline',
          size: stats.size,
          lastModified: stats.mtimeMs
        });
      }
    }

    // Sort files by most recently modified
    files.sort((a, b) => b.lastModified - a.lastModified);

    return NextResponse.json({ files });
  } catch (error: unknown) {
    console.error('Error fetching document files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}