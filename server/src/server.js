import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';
import { seedDatabase } from '../seed/seed.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

initSocket(io);

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is fresh
  try {
    const { User } = await import('./models/User.js');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('📦 Database is empty. Seeding demo accounts and donations...');
      await seedDatabase();
    }
  } catch (seedErr) {
    console.warn('Auto-seed warning:', seedErr.message);
  }

  server.listen(PORT, () => {
    console.log(`🚀 FoodBridgeAI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 WebSocket server initialized and listening.`);
  });
};

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
