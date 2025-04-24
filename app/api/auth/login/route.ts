import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../../utils/mongodb';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    // Find user
    const user = await usersCollection.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Set cookie for authentication
    const response = NextResponse.json({
      success: true,
      message: 'Login successful'
    });
    
    // Set cookie to expire in 7 days
    response.cookies.set({
      name: 'isLogged',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set({
      name: 'userId',
      value: user._id.toString(), // Assuming user._id is the MongoDB user ID
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/', // Use path '/' to make this cookie available across all routes
    });
    
    return response;
    
  } catch (error: unknown) {
    console.error('Error in login API:', error);
    
    // Type guard to safely access error.message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Login failed';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}