// server/src/routes/auth.ts - Fix login endpoint
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Helper to create JWT
function createToken(userId: number) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
}

// Database operation wrapper to handle connection errors gracefully
async function withDatabase<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === '28P01') {
      throw new Error('Database is not available. Please check your database connection.');
    }
    throw error;
  }
}

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUser = await withDatabase(async () => 
      pool.query('SELECT id FROM users WHERE email = $1', [email])
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User already exists with this email' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await withDatabase(async () =>
      pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) 
         RETURNING id, email, first_name, last_name, created_at`,
        [first_name, last_name, email, hashedPassword]
      )
    );

    const user = result.rows[0];
    const token = createToken(user.id);

    console.log(`✅ User registered successfully: ${email}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    if (error.message.includes('Database is not available')) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable. Database connection failed.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error during registration' 
    });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log(`🔄 Login attempt for email: ${email}`);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email
    const result = await withDatabase(async () =>
      pool.query(
        'SELECT id, email, first_name, last_name, password_hash FROM users WHERE email = $1',
        [email]
      )
    );

    if (result.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      console.log(`❌ Invalid password for user: ${email}`);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Create token
    const token = createToken(user.id);

    console.log(`✅ User logged in successfully: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    if (error.message.includes('Database is not available')) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable. Database connection failed.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error during login' 
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const result = await withDatabase(async () =>
      pool.query(
        `SELECT id, email, first_name, last_name, bio, institution, field_of_study, created_at 
         FROM users WHERE id = $1`,
        [userId]
      )
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('❌ Error fetching user profile:', error);
    
    if (error.message.includes('Database is not available')) {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable. Database connection failed.' 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;