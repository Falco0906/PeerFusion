// server/src/server.ts - Fix server startup and error handling
import { httpServer } from './app';
import { testDatabaseConnection } from './db';

const PORT = process.env.PORT || 5050;

// Test database connection before starting server
const startServer = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed. Server will start without database support.');
      console.log('💡 To enable database features, please:');
      console.log('   1. Install PostgreSQL');
      console.log('   2. Create a .env file with database credentials');
      console.log('   3. Create the database and user');
      console.log('   4. Restart the server');
    } else {
      console.log('✅ Database connection successful');
    }

    const server = httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('✅ Server is ready to accept connections');
      if (!dbConnected) {
        console.log('⚠️  Running in limited mode (no database)');
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please kill existing processes or use a different port.`);
        console.log('Run this to kill existing processes: sudo lsof -ti:5050 | xargs kill -9');
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
      }
    });

    // Handle graceful shutdown
    const gracefulShutdown = () => {
      console.log('📡 Received shutdown signal, shutting down gracefully...');
      server.close((err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  // Don't exit the process, just log
});

startServer();