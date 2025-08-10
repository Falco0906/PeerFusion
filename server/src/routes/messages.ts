// server/src/routes/messages.ts - Messaging API endpoints
import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get all conversations for the authenticated user
router.get('/conversations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // First get regular conversations with other users
    const regularConversations = await pool.query(`
      SELECT 
        c.id,
        c.last_message_at,
        c.last_message_id,
        m.content as last_message_content,
        m.sender_id as last_message_sender_id,
        CASE 
          WHEN c.user1_id = $1 THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar
      FROM conversations c
      LEFT JOIN messages m ON m.id = c.last_message_id
      LEFT JOIN users u ON u.id = CASE 
        WHEN c.user1_id = $1 THEN c.user2_id
        ELSE c.user1_id
      END
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.last_message_at DESC
    `, [userId]);

    // Then get self-conversations (messages sent to self)
    const selfConversations = await pool.query(`
      SELECT 
        'self_' || $1 as id,
        MAX(m.created_at) as last_message_at,
        MAX(m.id) as last_message_id,
        MAX(m.content) as last_message_content,
        MAX(m.sender_id) as last_message_sender_id,
        $1 as other_user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar
      FROM messages m
      JOIN users u ON u.id = $1
      WHERE (m.sender_id = $1 AND m.receiver_id = $1)
      GROUP BY u.first_name, u.last_name, u.email, u.avatar
      HAVING COUNT(*) > 0
    `, [userId]);

    // Combine both results
    const allConversations = [...regularConversations.rows, ...selfConversations.rows];
    
        // Sort by last message time
    allConversations.sort((a, b) => {
      const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return timeB - timeA;
    });

    res.json(allConversations);
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get chat history between two users (including self-conversations)
router.get('/chat/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.id;
    const otherUserId = parseInt(req.params.userId);
    
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if this is a self-conversation
    const isSelfConversation = currentUserId === otherUserId;

    // Get messages between the two users (or self-messages)
    const result = await pool.query(`
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.message_type,
        m.is_read,
        m.created_at,
        u.first_name,
        u.last_name,
        u.avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [currentUserId, otherUserId]);

    // Mark messages as read (except for self-messages to avoid infinite loop)
    if (!isSelfConversation) {
      await pool.query(`
        UPDATE messages 
        SET is_read = true 
        WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
      `, [otherUserId, currentUserId]);
    }

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { receiverId, content, messageType = 'text' } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    // Verify receiver exists (allow self-messaging)
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [receiverId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Allow self-messaging - no need to check if sender and receiver are the same

    // Insert message
    const result = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, sender_id, receiver_id, content, message_type, created_at
    `, [senderId, receiverId, content, messageType]);

    const message = result.rows[0];

    // Get sender info for the response
    const senderInfo = await pool.query(`
      SELECT first_name, last_name, avatar 
      FROM users WHERE id = $1
    `, [senderId]);

    const messageWithSender = {
      ...message,
      sender: senderInfo.rows[0]
    };

    console.log(`💬 Message sent from ${senderId} to ${receiverId}`);
    res.status(201).json(messageWithSender);

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/read/:senderId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const receiverId = (req as any).user.id;
    const senderId = parseInt(req.params.senderId);
    
    if (isNaN(senderId)) {
      return res.status(400).json({ error: 'Invalid sender ID' });
    }

    await pool.query(`
      UPDATE messages 
      SET is_read = true 
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
    `, [senderId, receiverId]);

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count (excluding self-messages)
router.get('/unread/count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const result = await pool.query(`
      SELECT COUNT(*) as unread_count
      FROM messages 
      WHERE receiver_id = $1 AND is_read = false AND sender_id != $1
    `, [userId]);

    res.json({ unreadCount: parseInt(result.rows[0].unread_count) });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;
