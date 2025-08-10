import app from './app';
import { pool } from './db';

const PORT = process.env.PORT || 5050;

// Function to check if port is available
const checkPort = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(port, (err: any) => {
      if (err) {
        resolve(false);
      } else {
        server.close(() => {
          resolve(true);
        });
      }
    });
    server.on('error', () => {
      resolve(false);
    });
  });
};

const startServer = async () => {
  try {
    const isPortAvailable = await checkPort(Number(PORT));
    
    if (!isPortAvailable) {
      console.error(`❌ Port ${PORT} is already in use. Please kill existing processes or use a different port.`);
      console.log('To kill existing processes, run: lsof -ti:5050 | xargs kill -9');
      process.exit(1);
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('🔍 Server is now listening for connections...');
      console.log('📡 Environment:', process.env.NODE_ENV || 'development');
    });

    // Add error handling for the server
    server.on('error', (error: any) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.log('💡 Port is already in use. Kill existing processes with: lsof -ti:5050 | xargs kill -9');
      }
    });

    server.on('listening', () => {
      console.log(`🎯 Server is listening on port: ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n📡 ${signal} received, shutting down gracefully...`);
      
      server.close(async (err) => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        try {
          await pool.end();
          console.log('✅ Database connections closed');
          console.log('✅ Server shutdown complete');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error closing database connections:', error);
          process.exit(1);
        }
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        console.log('⚠️ Forcing server shutdown...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      // Don't exit immediately, log the error and continue
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      // Don't exit immediately, log the error and continue
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();