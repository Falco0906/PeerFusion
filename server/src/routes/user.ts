import { Router } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, bio, institution, field_of_study, created_at FROM users WHERE id = $1',
      [userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  
  try {
    // If the ID is 'me', use the authenticated user's ID
    if (req.params.id === 'me') {
      const authenticatedUserId = (req as any).user.id;
      const result = await pool.query(
        'SELECT id, email, first_name, last_name, bio, institution, field_of_study, created_at FROM users WHERE id = $1',
        [authenticatedUserId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json(result.rows[0]);
    }
    
    // Otherwise, fetch the user by the provided ID
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, bio, institution, field_of_study, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
