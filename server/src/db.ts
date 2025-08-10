import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  // Add connection pool settings
  max: 20, // maximum number of connections in pool
  idleTimeoutMillis: 30000, // close connections after 30 seconds of inactivity
  connectionTimeoutMillis: 5000, // return error after 5 seconds if connection could not be established
});

// Test the connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful');
    console.log('✅ Database query test successful:', result.rows[0].now);
    
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    // Don't exit the process, just log the error
  }
};

// Test connection on startup
testConnection();

// Handle connection events
pool.on('connect', (client) => {
  console.log('🔌 New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err);
  // Don't exit the process, just log the error and continue
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing PostgreSQL pool...');
  await pool.end();
  console.log('✅ PostgreSQL pool closed');
});