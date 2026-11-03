import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  const uri = process.env.MONGODB_URI || 'memory';

  try {
    if (uri === 'memory' || !uri) {
      if (!mongoMemoryServer) {
        console.log('🔄 Initializing in-memory MongoDB Server for seamless zero-setup execution...');
        mongoMemoryServer = await MongoMemoryServer.create();
      }
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ In-Memory MongoDB connected at ${memoryUri}`);
    } else {
      await mongoose.connect(uri);
      console.log(`✅ MongoDB connected successfully to ${uri.split('@')[1] || uri}`);
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (!mongoMemoryServer) {
      console.log('🔄 Attempting fallback to in-memory MongoDB instance...');
      try {
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`✅ Fallback in-memory MongoDB connected at ${memoryUri}`);
      } catch (memErr) {
        console.error('❌ Fatal: In-memory MongoDB failed:', memErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
