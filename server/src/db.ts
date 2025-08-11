// server/src/db.ts - Fix database connection with proper error handling
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Check if required environment variables are set
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing database environment variables:', missingEnvVars.join(', '));
  console.log('💡 Create a .env file with the following variables:');
  console.log('   DB_USER=your_db_user');
  console.log('   DB_HOST=localhost');
  console.log('   DB_NAME=your_db_name');
  console.log('   DB_PASSWORD=your_db_password');
  console.log('   DB_PORT=5432');
}

export const pool = new Pool({
  user: process.env.DB_USER || 'peerfusion_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'peerfusion_db',
  password: process.env.DB_PASSWORD || 'peerfusion_password',
  port: Number(process.env.DB_PORT) || 5432,
  // Add connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Remove process.exit and improve error handling
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  // Don't exit the process - just log the error
});

// Test the connection on startup
export const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});