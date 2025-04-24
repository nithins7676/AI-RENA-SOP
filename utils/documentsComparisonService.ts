import { uploadFileToGemini, waitForFilesActive, getGeminiModel } from './geminiFileManager';
import { rateLimiter } from './langchainConfig';
import path from 'path';

// Use global variable for persistence across API routes
// This prevents the variable from being reset when Next.js imports the module in different contexts
declare global {
  var comparisonCache: any;
}

// Initialize global cache if not already set
if (!global.comparisonCache) {
  global.comparisonCache = null;
}

export function getCachedComparisonResult() {
  return global.comparisonCache;
}

/**
 * Compare multiple SOP documents with multiple regulatory guidelines
 */
export async function compareMultipleDocuments(sopPaths: string[], guidelinePaths: string[]): Promise<any> {
  try {
    console.log(`Comparing ${sopPaths.length} SOP(s) with ${guidelinePaths.length} guideline(s)`);
    
    // Upload all documents to Gemini
    const uploadedFiles: {
      sops: { path: string; file: any }[];
      guidelines: { path: string; file: any }[];
    } = {
      sops: [],
      guidelines: []
    };
    
    console.log("Uploading SOP documents...");
    for (const sopPath of sopPaths) {
      console.log(`- Uploading SOP: ${sopPath}`);
      const sopFile = await uploadFileToGemini(sopPath);
      uploadedFiles.sops.push({
        path: sopPath,
        file: sopFile
      });
    }
    
    console.log("Uploading Guideline documents...");
    for (const guidelinePath of guidelinePaths) {
      console.log(`- Uploading guideline: ${guidelinePath}`);
      const guidelineFile = await uploadFileToGemini(guidelinePath);
      uploadedFiles.guidelines.push({
        path: guidelinePath,
        file: guidelineFile
      });
    }
    
    // Wait for all files to be processed
    const allFiles = [
      ...uploadedFiles.sops.map(item => item.file),
      ...uploadedFiles.guidelines.map(item => item.file)
    ];
    await waitForFilesActive(allFiles);
    
    // Create the comparison prompt - updated for multiple documents
   // Update the comparison prompt with the new detailed requirements

// Replace the existing comparisonPrompt content with:
const comparisonPrompt = `You are a compliance comparison tool tasked with identifying ALL discrepancies between a Standard Operating Procedure (SOP) and its applicable regulatory guidelines. You must base your analysis EXCLUSIVELY on the content of the documents provided.

DOCUMENTS PROVIDED:
1. USER_PDF: SOP document(s) containing text, images, flowcharts, and tables
2. GUIDELINE_PDF: Regulatory requirements document(s)

PRIMARY MISSION: Detect EVERY instance where the SOP fails to align with applicable guideline requirements, using ONLY information contained within these documents.

COMPREHENSIVE COMPARISON METHODOLOGY:

1. SOP SCOPE ANALYSIS:
   - Thoroughly review the SOP to understand its specific scope and purpose
   - Document all processes, parameters, and requirements described in the SOP
   - Analyze all visual elements (flowcharts, diagrams, tables, images)

2. IDENTIFY APPLICABLE GUIDELINES:
   - Based on the SOP's scope, identify only the relevant guideline sections
   - Create an inventory of all requirements from these applicable sections

3. SYSTEMATIC DISCREPANCY DETECTION:
   For each applicable guideline requirement, check:
   - Is it fully implemented in the SOP? (completely/partially/not at all)
   - If implemented, does it match EXACTLY? (terminology, values, procedures)
   - Are there logical inconsistencies between the SOP and guideline?
   - Do flowcharts and visual elements align with guideline requirements?

DISCREPANCY TYPES TO IDENTIFY (ALL BASED STRICTLY ON DOCUMENT CONTENT):

1. CONTENT DISCREPANCIES:
   - Missing requirements (guideline elements not in SOP)
   - Contradictory information (direct conflicts)
   - Different parameter values (temperatures, times, frequencies, etc.)
   - Different procedural steps or sequences
   - Different roles or responsibilities
   - Different terminology that changes meaning
   - Different acceptance criteria or limits

2. LOGICAL DISCREPANCIES:
   - Process flows that don't achieve guideline requirements
   - Decision criteria that don't match guideline expectations
   - Control measures inadequate to meet specified requirements
   - Conflicting information within the SOP relative to guidelines
   - Prerequisites or conditions that differ from guidelines

3. VISUAL CONTENT DISCREPANCIES:
   - Flowcharts showing processes that differ from guideline requirements
   - Tables with different parameters or criteria than guidelines specify
   - Diagrams with missing elements required by guidelines
   - Images showing procedures inconsistent with guideline descriptions
   - Visual decision trees with different logic than guidelines require

For each discrepancy found, document:
- The exact text/content from both documents (with page numbers)
- The precise nature of the discrepancy
- Why it represents a failure to meet the guideline requirement (based solely on comparing the documents)

Output a comprehensive JSON array of ALL discrepancies:

{
  "id": [sequential number],
  "discrepancy_type": ["missing_requirement", "contradictory_information", "different_parameter", "logical_inconsistency", "procedural_difference", "visual_mismatch"],
  "section": [specific section reference],
  "content_location": ["text", "flowchart", "diagram", "table", "image"],
  "Guidelines": [exact text/description of requirement],
  "Guidelines_pageNumber": [page number],
  "User_pdf": [corresponding SOP content or "missing" if omitted],
  "User_pdf_pageNumber": [page number],
  "severity": ["high", "medium", "low"],
  "explanation": [precise explanation of the discrepancy, based ONLY on comparing the documents]
}

CRITICAL INSTRUCTION: Identify ALL discrepancies by methodically comparing every applicable guideline requirement to the SOP. Your analysis must be based EXCLUSIVELY on the content of the documents provided - do not introduce external knowledge or make assumptions beyond what is explicitly stated in the documents.`;

    // System instruction
    const systemInstruction = `You are a pharmaceutical compliance comparison system designed to identify ALL discrepancies between SOPs and guidelines. Your analysis must be based EXCLUSIVELY on the content of the documents provided - you must not introduce external knowledge, assumptions, or interpretations beyond what is explicitly stated in the documents.

Your purpose is to meticulously compare SOPs against applicable guidelines, identifying every instance where they fail to align. You must examine both textual content and visual elements (flowcharts, tables, images) with equal rigor, detecting explicit contradictions, omissions, logical inconsistencies, and procedural misalignments.

Your analysis must be comprehensive, objective, and based solely on the content of the documents provided.`;

    // Get the model and apply rate limiting
    const model = getGeminiModel();
    await rateLimiter();
    
    // Create a chat session with system instruction
    const chatSession = model.startChat({
  generationConfig: {
    temperature: 0.1,
    topK: 40,
    topP: 0.8,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json', // Add this for JSON response format
    responseSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            description: 'Sequential number identifier',
          },
          discrepancy_type: {
            type: 'string',
            description: 'Type of discrepancy found',
            enum: ['missing_requirement', 'contradictory_information', 'different_parameter', 'logical_inconsistency', 'procedural_difference', 'visual_mismatch'],
          },
          section: {
            type: 'string',
            description: 'Specific section reference',
          },
          content_location: {
            type: 'string',
            description: 'Where the content is located',
            enum: ['text', 'flowchart', 'diagram', 'table', 'image'],
          },
          Guidelines: {
            type: 'string',
            description: 'Exact text/description of requirement',
          },
          Guidelines_pageNumber: {
            type: 'number',
            description: 'Page number in guidelines document',
          },
          User_pdf: {
            type: 'string',
            description: 'Corresponding SOP content or "missing" if omitted',
          },
          User_pdf_pageNumber: {
            type: 'number',
            description: 'Page number in SOP document',
          },
          severity: {
            type: 'string',
            description: 'Severity level of the discrepancy',
            enum: ['high', 'medium', 'low'],
          },
          explanation: {
            type: 'string',
            description: 'Precise explanation of the discrepancy',
          }
        },
        required: ['id', 'discrepancy_type', 'section', 'Guidelines', 'Guidelines_pageNumber', 'User_pdf', 'severity', 'explanation'],
      }
    }
  },
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }]
        },
        {
          role: "model",
          parts: [{ text: "I understand my role as a pharmaceutical regulatory compliance analysis system. I'll thoroughly compare all the provided SOP documents against all guideline documents to identify any discrepancies, ensuring no compliance risks are missed. I'll structure my findings in valid JSON format with proper severity assessments, focusing on legitimate differences without inventing issues. I'll extract text verbatim with precise page references and indicate which specific documents are involved in each finding." }]
        }
      ]
    });
    
    // Build the parts with file references for all documents
    const parts = [];
    
    // Add all SOP documents
    for (const sop of uploadedFiles.sops) {
      parts.push({
        fileData: {
          mimeType: "application/pdf",
          fileUri: sop.file.uri,
        },
      });
    }
    
    // Add all guideline documents
    for (const guideline of uploadedFiles.guidelines) {
      parts.push({
        fileData: {
          mimeType: "application/pdf",
          fileUri: guideline.file.uri,
        },
      });
    }
    
    // Add the instruction text
    parts.push({ text: comparisonPrompt });
    
    console.log("Sending multi-document comparison request to Gemini...");

    function formatTextContent(text: string): string {
      if (!text) return '';
      
      // Replace literal '\n' strings with actual line breaks
      let formattedText = text.replace(/\\n/g, '\n');
      
      // Format lists (lines starting with -, *, or numbers followed by period/parenthesis)
      formattedText = formattedText.replace(/^([\s]*[-*]|[\s]*\d+[.)])[\s]+(.*)/gm, '$1 $2');
      
      // Ensure paragraph breaks have double line breaks
      formattedText = formattedText.replace(/\n\s*\n/g, '\n\n');
      
      return formattedText;
    }

const result = await chatSession.sendMessage(parts);
const response = result.response.text();

// Since we're using responseMimeType: 'application/json', we should get valid JSON directly
let jsonData;
try {
  // Parse the response as JSON
  jsonData = JSON.parse(response);
  console.log(`Successfully parsed JSON response with ${jsonData.length} items`);
  
  // Transform data with source file information
  // Define interfaces for the data structures
  interface GeminiResponseItem {
    id: number;
    discrepancy_type: string;
    section: string;
    content_location: string;
    Guidelines: string;
    Guidelines_pageNumber: number;
    User_pdf: string;
    User_pdf_pageNumber: number;
    severity: string;
    explanation: string;
    User_pdf_document?: string;
    Guidelines_document?: string;
  }

  interface TransformedDataItem {
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
    discrepancy_type: string;
    content_location: string;
    sourceFiles: {
      sop: string;
      guideline: string;
    };
  }

    const transformedData: TransformedDataItem[] = jsonData.map((item: GeminiResponseItem) => {
      // Get source filenames
      const sopFileName: string = item.User_pdf_document || 
        path.basename(sopPaths[0]); // Default to first SOP if not specified
          
      const guidelineFileName: string = item.Guidelines_document || 
        path.basename(guidelinePaths[0]); // Default to first guideline if not specified
      
      // Try to match filenames to actual paths
      let sopPath: string = sopPaths.find(p => p.includes(sopFileName)) || sopPaths[0];
      let guidelinePath: string = guidelinePaths.find(p => p.includes(guidelineFileName)) || guidelinePaths[0];
      
      return {
        id: item.id,
        section: item.section,
        status: "discrepancy", // All items from this schema are discrepancies
        regulation: formatTextContent(item.Guidelines),
        documentation: formatTextContent(item.User_pdf),
        pdfUrl: guidelinePath,
        guidelinesPdfUrl: guidelinePath,
        sopPdfUrl: sopPath,
        pageNumber: item.Guidelines_pageNumber,
        sopPageNumber: item.User_pdf_pageNumber,
        severity: item.severity,
        comment: formatTextContent(item.explanation),
        discrepancy_type: item.discrepancy_type,
        content_location: item.content_location,
        sourceFiles: {
          sop: sopFileName,
          guideline: guidelineFileName
        }
      };
    });
  
  global.comparisonCache = transformedData;
  return transformedData;
} catch (jsonError) {
  console.error("Failed to parse JSON response:", jsonError);
    try {
      // Attempt to manually extract and structure the data
      const items = extractComparisonItemsManually(response);
      
      if (items && items.length > 0) {
        console.log(`Successfully extracted ${items.length} comparison items manually`);
        
        // Transform data with source file information
        const transformedData = items.map(item => {
          // Get source filenames (either from the response or use defaults)
          const sopFileName = item.User_pdf_document || 
            path.basename(sopPaths[0]); // Default to first SOP if not specified
            
          const guidelineFileName = item.Guidelines_document || 
            path.basename(guidelinePaths[0]); // Default to first guideline if not specified
            
          // Try to match filenames to actual paths
          let sopPath = sopPaths.find(p => p.includes(sopFileName)) || sopPaths[0];
          let guidelinePath = guidelinePaths.find(p => p.includes(guidelineFileName)) || guidelinePaths[0];
          
          return {
            id: item.id,
            section: item.section,
            status: item.status,
            regulation: item.Guidelines,
            documentation: item.User_pdf,
            pdfUrl: guidelinePath,
            guidelinesPdfUrl: guidelinePath,
            sopPdfUrl: sopPath,
            pageNumber: item.Guidelines_pageNumber,
            sopPageNumber: item.User_pdf_pageNumber,
            severity: item.severity || 'none',
            comment: item.comment,
            sourceFiles: {
              sop: sopFileName,
              guideline: guidelineFileName
            }
          };
        });
        
        global.comparisonCache = transformedData;
        return transformedData;
      } else {
        throw new Error("Failed to extract comparison items manually");
      }
    } catch (manualError) {
      console.error("Failed to process response manually:", manualError);
      
      const errorData = {
        error: true,
        message: "Failed to process comparison results",
        details: manualError instanceof Error ? manualError.message : String(manualError)
      };
      global.comparisonCache = errorData;
      return errorData;
    }
  } 
  } catch (error) {
    console.error("Unexpected error in document comparison:", error);
    const errorData = {
      error: true,
      message: "Unexpected error during document comparison",
      details: error instanceof Error ? error.message : String(error)
    };
    global.comparisonCache = errorData;
    return errorData;
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function compareDocuments(sopPath: string, guidelinePath: string): Promise<any> {
  // Call the multi-document comparison with single files
  return compareMultipleDocuments([sopPath], [guidelinePath]);
}

// Function to manually extract data without relying on JSON.parse:
function extractComparisonItemsManually(text: string): any[] {
  const items = [];
  
  // First attempt: Use regex to extract items
  const itemRegex = /"id":\s*(\d+)[^{]*?"section":\s*"([^"]*)"[^{]*?"status":\s*"([^"]*)"[^{]*?"Guidelines":\s*"([^"]*)"[^{]*?"Guidelines_(?:document|filename)?(?:")?:\s*"?([^",\}]*)"?[^{]*?"Guidelines_pageNumber":\s*"?([^",\}]*)"?[^{]*?"User_pdf":\s*"([^"]*)"[^{]*?"User_pdf_(?:document|filename)?(?:")?:\s*"?([^",\}]*)"?[^{]*?"User_pdf_pageNumber":\s*"?([^",\}]*)"?[^{]*?"severity":\s*"([^"]*)"[^{]*?"comment":\s*"([^"]*)"/g;

  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    items.push({
      id: Number(match[1]),
      section: match[2],
      status: match[3],
      Guidelines: match[4],
      Guidelines_document: match[5],
      Guidelines_pageNumber: match[6],
      User_pdf: match[7],
      User_pdf_document: match[8], 
      User_pdf_pageNumber: match[9],
      severity: match[10],
      comment: match[11]
    });
  }
  
  // If regex approach failed, try line-by-line parsing
  if (items.length === 0) {
    // Split by items (each starting with "id": number)
    const itemBlocks = text.split(/"id":\s*\d+/).filter(block => block.trim().length > 0);
    
    let id = 0;
    for (const block of itemBlocks) {
      id++;
      const item: any = { id };
      
      // Extract section
      const sectionMatch = block.match(/"section":\s*"([^"]*)"/);
      if (sectionMatch) item.section = sectionMatch[1];
      
      // Extract status
      const statusMatch = block.match(/"status":\s*"([^"]*)"/);
      if (statusMatch) item.status = statusMatch[1];
      
      // Extract Guidelines
      const guidelinesMatch = block.match(/"Guidelines":\s*"([^"]*)"/);
      if (guidelinesMatch) item.Guidelines = guidelinesMatch[1];
      
      // Extract Guidelines_document
      const guidelinesDocMatch = block.match(/"Guidelines_(?:document|filename)":\s*"([^"]*)"/);
      if (guidelinesDocMatch) item.Guidelines_document = guidelinesDocMatch[1];
      
      // Extract Guidelines_pageNumber
      const guidelinesPgMatch = block.match(/"Guidelines_pageNumber":\s*"?([^",\}]*)"/);
      if (guidelinesPgMatch) item.Guidelines_pageNumber = guidelinesPgMatch[1];
      
      // Extract User_pdf
      const userPdfMatch = block.match(/"User_pdf":\s*"([^"]*)"/);
      if (userPdfMatch) item.User_pdf = userPdfMatch[1];
      
      // Extract User_pdf_document
      const userPdfDocMatch = block.match(/"User_pdf_(?:document|filename)":\s*"([^"]*)"/);
      if (userPdfDocMatch) item.User_pdf_document = userPdfDocMatch[1];
      
      // Extract User_pdf_pageNumber
      const userPdfPgMatch = block.match(/"User_pdf_pageNumber":\s*"?([^",\}]*)"/);
      if (userPdfPgMatch) item.User_pdf_pageNumber = userPdfPgMatch[1];
      
      // Extract severity
      const severityMatch = block.match(/"severity":\s*"([^"]*)"/);
      if (severityMatch) item.severity = severityMatch[1];
      
      // Extract comment
      const commentMatch = block.match(/"comment":\s*"([^"]*)"/);
      if (commentMatch) item.comment = commentMatch[1];
      
      items.push(item);
    }
  }
  
  // Ensure all items have the required fields with reasonable defaults
  const processedItems = items.map(item => ({
    id: item.id || 0,
    section: item.section || "Unknown section",
    status: item.status || "unknown",
    Guidelines: item.Guidelines || "No guideline text available",
    Guidelines_document: item.Guidelines_document || "",
    Guidelines_pageNumber: item.Guidelines_pageNumber || "N/A",
    User_pdf: item.User_pdf || "No SOP text available",
    User_pdf_document: item.User_pdf_document || "",
    User_pdf_pageNumber: item.User_pdf_pageNumber || "N/A",
    severity: item.severity || "none",
    comment: item.comment || "No comment provided"
  }));
  
  console.log(`Manually extracted ${processedItems.length} items from text`);
  return processedItems;
}