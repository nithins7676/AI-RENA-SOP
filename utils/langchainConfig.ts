// Simplified version focusing on just what's needed for direct PDF upload

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API Key. Please set the GEMINI_API_KEY environment variable.");
}

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 10,
  requestsPerDay: 1500,
  requestQueue: [] as number[],
  dailyCount: 0,
  dayStart: Date.now(),
};

// Rate limiter function to ensure we don't exceed API limits
export const rateLimiter = async (): Promise<void> => {
  const now = Date.now();
  
  // Reset daily counter if it's a new day
  if (now - RATE_LIMIT.dayStart > 24 * 60 * 60 * 1000) {
    RATE_LIMIT.dailyCount = 0;
    RATE_LIMIT.dayStart = now;
  }
  
  // Check if we've exceeded daily limit
  if (RATE_LIMIT.dailyCount >= RATE_LIMIT.requestsPerDay) {
    throw new Error('Daily API request limit exceeded. Please try again tomorrow.');
  }
  
  // Clean up old requests from queue (older than 1 minute)
  RATE_LIMIT.requestQueue = RATE_LIMIT.requestQueue.filter(
    time => now - time < 60 * 1000
  );
  
  // Check if we've hit rate limit for current minute
  if (RATE_LIMIT.requestQueue.length >= RATE_LIMIT.requestsPerMinute) {
    // Calculate time to wait until oldest request is more than a minute old
    const oldestRequest = RATE_LIMIT.requestQueue[0];
    const waitTime = 60 * 1000 - (now - oldestRequest);
    
    // Wait for that duration
    await new Promise(resolve => setTimeout(resolve, waitTime + 50)); // Add 50ms buffer
    
    // Recursive call to check again after waiting
    return rateLimiter();
  }
  
  // Add current request to queue and increment daily count
  RATE_LIMIT.requestQueue.push(now);
  RATE_LIMIT.dailyCount++;
};

// System prompt for regulatory compliance
export const SYSTEM_PROMPT = `You are an AI assistant specialized in regulatory compliance and document analysis. 
Your primary role is to help users understand the relationship between Standard Operating Procedures (SOPs) 
and regulatory guidelines/requirements.

CAPABILITIES:
- Analyze regulatory documents and SOPs to identify compliance gaps
- Explain regulatory requirements in clear, simple language
- Compare different documents to identify contradictions or alignments
- Answer questions about specific sections of documents that users reference
- Provide factual information based only on the documents mentioned

LIMITATIONS:
- Only reference information from the documents explicitly mentioned by the user with @(document_name)
- If the answer cannot be found in the mentioned documents, acknowledge this limitation
- Do not provide legal advice or claim regulatory authority
- Do not hallucinate content that is not present in the referenced documents

RESPONSE GUIDELINES:
- Be concise and focused on answering the specific question
- When analyzing a document, clearly indicate which document and section you are referencing
- When comparing documents, organize your response with clear headings
- Use bullet points for clarity when listing multiple items
- If the user doesn't reference any document, ask which specific document they'd like you to analyze

Always be professional, precise, and helpful while maintaining the factual boundaries of the referenced documents.`;