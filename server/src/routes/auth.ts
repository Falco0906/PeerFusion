import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Helper to create JWT
function createToken(userId: number) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

// Register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name`,
      [email, hashed, first_name, last_name]
    );

    const user = result.rows[0];
    const token = createToken(user.id);

    res.status(201).json({ token, ...user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for email:', email);

  try {
    const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if (result.rows.length === 0) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('User found, ID:', user.id);
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password valid, generating token for user:', user.id);
    const token = createToken(user.id);
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('Fetching user data for ID:', (req as any).user.id);
    
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, bio, institution, field_of_study, created_at FROM users WHERE id = $1`,
      [(req as any).user.id]
    );

    if (result.rows.length === 0) {
      console.log('User not found for ID:', (req as any).user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = result.rows[0];
    console.log('User data fetched successfully:', { id: userData.id, email: userData.email });
    
    // Convert timestamp to ISO string for JSON serialization
    if (userData.created_at) {
      userData.created_at = userData.created_at.toISOString();
    }
    
    res.json(userData);
  } catch (err) {
    console.error('Error in /me endpoint:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;

