// server/src/routes/messages.ts - Messaging API endpoints
import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Get all conversations for the authenticated user
router.get('/conversations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Get all messages where user is sender or receiver
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        created_at,
        sender:users!messages_sender_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar
        ),
        receiver:users!messages_receiver_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar
        )
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group messages by conversation
    const conversationsMap = new Map();
    
    (messages || []).forEach((msg: any) => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
      const conversationKey = `conv_${Math.min(userId, otherUserId)}_${Math.max(userId, otherUserId)}`;
      
      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          id: conversationKey,
          other_user_id: otherUserId,
          first_name: otherUser.first_name,
          last_name: otherUser.last_name,
          email: otherUser.email,
          avatar: otherUser.avatar,
          last_message_at: msg.created_at,
          last_message_id: msg.id,
          last_message_content: msg.content,
          last_message_sender_id: msg.sender_id
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());
    conversations.sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    res.json(conversations);
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

    // Get messages between the two users
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        message_type,
        is_read,
        created_at
      `)
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),` +
        `and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
      )
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark messages as read (except for self-messages)
    if (currentUserId !== otherUserId) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false);
    }

    res.json(messages || []);
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

    // Verify receiver exists
    const { data: receiver, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', receiverId)
      .single();

    if (userError || !receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        message_type: messageType,
        is_read: false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`💬 Message sent from ${senderId} to ${receiverId}`);
    res.status(201).json(message);

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

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('is_read', false);

    if (error) throw error;

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
    
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (error) throw error;

    res.json({ unreadCount: count || 0 });
  } catch (error: any) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;
