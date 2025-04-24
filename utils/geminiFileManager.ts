const {
    GoogleGenerativeAI,
    Type,    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const { GoogleAIFileManager } = require("@google/generative-ai/server");
  import { rateLimiter } from './langchainConfig';
  import fs from 'fs';
  import path from 'path';
  
  // Initialize the Gemini API client
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please set the GEMINI_API_KEY environment variable.");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });
  
  /**
   * Uploads a PDF file to Gemini API
   */
  export async function uploadFileToGemini(filePath: string) {
    try {
      await rateLimiter();
      
      // Normalize path handling to ensure consistency
      let normalizedPath = filePath;
      if (normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.substring(1);
      }
      
      // Check if file actually exists in the filesystem
      console.log("Checking directories for:", path.basename(filePath));
      const baseDir = path.join(process.cwd(), 'public', 'content', 'guidelines');
      if (fs.existsSync(baseDir)) {
        const files = fs.readdirSync(baseDir);
        console.log(`Files in directory: ${files.join(', ')}`);
      }
      
      // Try multiple path combinations to find the file
      const possiblePaths = [
        // Check original path as-is
        path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), 'public', filePath),
        // Check normalized path
        path.join(process.cwd(), 'public', normalizedPath),
        // Check alternative structure
        path.join(process.cwd(), normalizedPath),
        // Try sanitizing filename by normalizing spaces
        path.join(process.cwd(), 'public', normalizedPath.replace(/\s+/g, ' ')),
        // Try with URL encoding/decoding
        path.join(process.cwd(), 'public', decodeURIComponent(normalizedPath))
      ];
      
      // Try to find the file in possible locations
      let fullPath = null;
      for (const testPath of possiblePaths) {
        console.log(`Checking if file exists at: ${testPath}`);
        if (fs.existsSync(testPath)) {
          fullPath = testPath;
          break;
        }
      }
      
      if (!fullPath) {
        // As a last resort, try to find the file by partial name match
        const dirPath = path.dirname(path.join(process.cwd(), 'public', normalizedPath));
        const fileBaseName = path.basename(normalizedPath).split('_')[0]; // Get first part of filename
        
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          const matchingFile = files.find(f => f.includes(fileBaseName));
          
          if (matchingFile) {
            fullPath = path.join(dirPath, matchingFile);
            console.log(`Found file by partial name match: ${fullPath}`);
          }
        }
      }
      
      if (!fullPath) {
        throw new Error(`PDF file not found. Tried paths: ${possiblePaths.join(', ')}`);
      }
      
      console.log(`Found PDF at path: ${fullPath}`);
      
      // Upload to Gemini
      const uploadResult = await fileManager.uploadFile(fullPath, {
        mimeType: "application/pdf",
        displayName: path.basename(fullPath),
      });
      
      console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.name}`);
      return uploadResult.file;
    } catch (error) {
      console.error('Error uploading file to Gemini:', error);
      throw error;
    }
  }
  
  /**
   * Waits for the given files to be active
   */
  export async function waitForFilesActive(files: any[]) {
    console.log("Waiting for file processing...");
    for (const name of files.map((file) => file.name)) {
      let file = await fileManager.getFile(name);
      while (file.state === "PROCESSING") {
        process.stdout.write(".");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        file = await fileManager.getFile(name);
      }
      if (file.state !== "ACTIVE") {
        throw Error(`File ${file.name} failed to process`);
      }
    }
    console.log("...all files ready");
    return true;
  }
  
  /**
   * Get model for chat with files
   */
  export function getGeminiModel() {
    return model;
  }
  
  /**
   * Create a chat session with Gemini model
   */
  export function createChatSession(systemPrompt?: string) {
    return model.startChat({
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
      history: systemPrompt ? [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'll help analyze documents according to these guidelines." }]
        }
      ] : []
    });
  }