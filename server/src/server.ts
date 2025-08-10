// server/src/server.ts - Fix server startup and error handling
import app from './app';
import { testDatabaseConnection } from './db';

const PORT = process.env.PORT || 5050;

// Test database connection before starting server
const startServer = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your database connection.');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('✅ Server is ready to accept connections');
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