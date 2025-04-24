import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../../utils/mongodb';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, password, name } = await request.json();
    
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
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = {
      email,
      password: hashedPassword,
      name: name || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
       // Save to database
       await usersCollection.insertOne(user);
    
       // Return user without password (using // eslint-disable-next-line to acknowledge intentional non-use)
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
       const { password: _password, ...userWithoutPassword } = user;
       return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in signup API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}