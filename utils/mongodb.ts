import { MongoClient } from 'mongodb';

// Update connection string for local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multimodal_rag';

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Create MongoDB client without TLS options for local connection
    const client = new MongoClient(MONGODB_URI, {
      // Remove SSL/TLS options for local connections
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      ssl:true,
    });
    
    // Connect to MongoDB
    await client.connect();
    const db = client.db();

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}