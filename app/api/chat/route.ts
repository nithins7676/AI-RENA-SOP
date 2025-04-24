import { NextRequest, NextResponse } from 'next/server';
import { processConversation, clearConversation, getConversationHistory } from '../../../utils/conversationManager';
import { rateLimiter } from '../../../utils/langchainConfig';

/**
 * POST endpoint to process chat messages
 * Handles sending messages with document references to Gemini
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting first
    await rateLimiter();
    
    // Parse request body
    const body = await request.json();
    const { message, mentions } = body;
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }
    
    console.log(`Processing chat message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    console.log(`With ${mentions?.length || 0} document references`);
    
    // Process with conversationManager
    const response = await processConversation({
      message,
      mentions: mentions || []
    });
    
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Error in chat API:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your message';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        id: Date.now().toString(),
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint to clear conversation history
 */
export async function DELETE() {
  try {
    await clearConversation();
    return NextResponse.json({ success: true, message: 'Conversation history cleared' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to clear conversation history';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve conversation history
 */
export async function GET() {
  try {
    const history = await getConversationHistory();
    return NextResponse.json({ history });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve conversation history';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}