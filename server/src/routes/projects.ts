import { Router } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Create project
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, link } = req.body;
  const userId = (req as any).user.id;
  try {
    const result = await pool.query(
      'INSERT INTO projects (user_id, title, description, link) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, description, link]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add project' });
  }
});

// Get projects for logged-in user
router.get('/', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const result = await pool.query('SELECT * FROM projects WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

export default router;
