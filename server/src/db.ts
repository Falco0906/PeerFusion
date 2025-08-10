import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT)
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  // DON'T exit the process - just log the error
});

// Test connection on startup
pool.connect()
  .then(() => {
    console.log('✅ Database connection test successful');
    return pool.query('SELECT NOW()');
  })
  .then(result => {
    console.log('✅ Database query test successful:', result.rows[0].now);
  })
  .catch(err => {
    console.error('❌ Database connection test failed:', err.message);
  });