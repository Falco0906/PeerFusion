import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Helper to create JWT
function createToken(userId: number) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Register user
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, first_name, last_name } = req.body;
  
  console.log('📝 Registration attempt for:', email);

  try {
    // Validate input
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, email, first_name, last_name, created_at`,
      [email, hashedPassword, first_name, last_name]
    );

    const newUser = result.rows[0];
    console.log('✅ User registered successfully:', email);

    // Generate token
    const token = createToken(newUser.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt for:', email);

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password, first_name, last_name, bio, institution, field_of_study, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', email);

    // Generate token
    const token = createToken(user.id);

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    console.log('👤 Fetching user profile for ID:', userId);

    const result = await pool.query(
      `SELECT id, email, first_name, last_name, bio, institution, field_of_study, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User profile fetched successfully');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;