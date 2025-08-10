import { Router } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get user by ID or 'me'
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const paramId = req.params.id;
    const authenticatedUserId = (req as any).user.id;
    
    console.log('👤 Fetching user profile for param:', paramId, 'authenticated user:', authenticatedUserId);
    
    // If the ID is 'me', use the authenticated user's ID
    const userId = paramId === 'me' ? authenticatedUserId : parseInt(paramId);
    
    if (paramId !== 'me' && isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
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
  } catch (err) {
    console.error('❌ Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { first_name, last_name, bio, institution, field_of_study } = req.body;
    
    console.log('📝 Updating profile for user ID:', userId);
    
    // Validate input
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, bio = $3, institution = $4, field_of_study = $5
       WHERE id = $6
       RETURNING id, email, first_name, last_name, bio, institution, field_of_study, created_at`,
      [first_name, last_name, bio, institution, field_of_study, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ Profile updated successfully');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;