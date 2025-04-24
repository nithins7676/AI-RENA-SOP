import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { saveFileMetadata } from '../../../utils/filesService';

// Ensure directories exist
const sopDir = path.join(process.cwd(), 'public', 'content', 'sop');
const guidelinesDir = path.join(process.cwd(), 'public', 'content', 'guidelines');

if (!fs.existsSync(sopDir)) {
  fs.mkdirSync(sopDir, { recursive: true });
}

if (!fs.existsSync(guidelinesDir)) {
  fs.mkdirSync(guidelinesDir, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!['sop', 'guidelines'].includes(type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Use original filename
    const fileName = file.name;
    
    // Create destination directory based on file type
    const destDir = type === 'sop' ? sopDir : guidelinesDir;
    const filePath = path.join(destDir, fileName);
    
    // Check if file already exists physically and use a different name if needed
    let finalFileName = fileName;
    let finalFilePath = filePath;
    
    if (fs.existsSync(filePath)) {
      // If file physically exists, add a timestamp suffix
      const fileExt = path.extname(fileName);
      const fileNameWithoutExt = path.basename(fileName, fileExt);
      finalFileName = `${fileNameWithoutExt}_${Date.now()}${fileExt}`;
      finalFilePath = path.join(destDir, finalFileName);
    }
    
    try {
      // Save the file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(finalFilePath, buffer);
      
      // Save metadata to MongoDB
      const relativePath = `/content/${type}/${finalFileName}`;
      const fileDocument = await saveFileMetadata({
        originalName: fileName,
        path: relativePath,
        type: type as 'sop' | 'guidelines',
        size: file.size,
        uploadDate: new Date(),
        filePath: finalFilePath
      });
      
      return NextResponse.json({
        name: fileDocument.originalName,
        path: fileDocument.path,
        type: fileDocument.type,
        size: fileDocument.size
      });
    } catch (fileError) {
      console.error('File processing error:', fileError);
      return NextResponse.json({ 
        error: 'File processing failed', 
        details: fileError instanceof Error ? fileError.message : String(fileError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}