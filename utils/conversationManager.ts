import { 
  rateLimiter,
  SYSTEM_PROMPT
} from './langchainConfig';
import { 
  uploadFileToGemini, 
  waitForFilesActive, 
  createChatSession 
} from './geminiFileManager';

// Types
export interface StoredFile {
  name: string;
  path: string;
  type: 'sop' | 'guideline';
  mentionId?: string;
}

export interface ConversationMessage {
  id: string;
  content: string;
  type: 'user' | 'bot';
  mentions?: StoredFile[];
  timestamp: number;
}

export interface ConversationRequest {
  message: string;
  mentions?: StoredFile[];
  userId?: string;
}

export interface ConversationResponse {
  id: string;
  content: string;
  mentions?: StoredFile[];
  timestamp: number;
}

// Keep a simple memory of recent conversations
let conversationMemory: {
  messages: { role: string, content: string }[];
} = { messages: [] };

/**
 * Process a user message and generate a response
 */
export async function processConversation(request: ConversationRequest): Promise<ConversationResponse> {
  const { message, mentions = [] } = request;
  
  try {
    // Start tracking response time
    const startTime = Date.now();
    
    // If no documents are mentioned, use regular conversation flow
    if (!mentions || mentions.length === 0) {
      // Apply rate limiting
      await rateLimiter();
      
      // Create a chat session
      const chatSession = createChatSession(SYSTEM_PROMPT);
      
      // Add conversation history if any
      if (conversationMemory.messages.length > 0) {
        for (const msg of conversationMemory.messages) {
          await chatSession.sendMessage(msg.content);
        }
      }
      
      // Send user message
      const result = await chatSession.sendMessage(message);
      const response = result.response.text();
      
      // Store in memory
      conversationMemory.messages.push({ role: 'user', content: message });
      conversationMemory.messages.push({ role: 'assistant', content: response });
      
      // Limit memory size
      if (conversationMemory.messages.length > 10) {
        conversationMemory.messages = conversationMemory.messages.slice(-10);
      }
      
      return {
        id: Date.now().toString(),
        content: response,
        timestamp: Date.now()
      };
    }
    
    // Documents are mentioned - use direct file uploads to Gemini
    console.log(`Processing ${mentions.length} documents for query: "${message}"`);
    
    try {
      // Upload all mentioned files to Gemini
      const uploadPromises = mentions.map(doc => uploadFileToGemini(doc.path));
      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Wait for all files to be processed
      await waitForFilesActive(uploadedFiles);
      
      // Create file parts for the model
      const fileParts = uploadedFiles.map(file => ({
        fileData: {
          mimeType: "application/pdf",
          fileUri: file.uri,
        },
      }));
      
      // Create the chat session with system prompt
      const chatSession = createChatSession(SYSTEM_PROMPT);
      
      // Send message with file references
      const parts = [
        ...fileParts,
        { text: message }
      ];
      
      await rateLimiter();
      const result = await chatSession.sendMessage(parts);
      const response = result.response.text();
      
      // Store in memory (though file references aren't stored properly in this simplified version)
      conversationMemory.messages.push({ role: 'user', content: message });
      conversationMemory.messages.push({ role: 'assistant', content: response });
      
      // Limit memory size
      if (conversationMemory.messages.length > 10) {
        conversationMemory.messages = conversationMemory.messages.slice(-10);
      }
      
      // Log processing time
      const processingTime = Date.now() - startTime;
      console.log(`Document analysis completed in ${processingTime / 1000}s`);
      
      return {
        id: Date.now().toString(),
        content: response,
        timestamp: Date.now()
      };
      
    } catch (error: any) {
      console.error('Error processing documents with direct upload:', error);
      return {
        id: Date.now().toString(),
        content: `I encountered an error analyzing the documents: ${error.message}. Please try again later.`,
        timestamp: Date.now()
      };
    }
  } catch (error: any) {
    console.error('Error in conversation processing:', error);
    return {
      id: Date.now().toString(),
      content: `I'm sorry, I encountered an error processing your request: ${error.message}. Please try again.`,
      timestamp: Date.now()
    };
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(): Promise<any[]> {
  return conversationMemory.messages.map((msg, index) => ({
    id: index.toString(),
    content: msg.content,
    type: msg.role === 'user' ? 'user' : 'bot',
    timestamp: Date.now() - (conversationMemory.messages.length - index) * 1000
  }));
}

/**
 * Clear conversation history
 */
export async function clearConversation(): Promise<void> {
  conversationMemory = { messages: [] };
  return;
}