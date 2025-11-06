-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at_trigger
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
-- Users can read messages where they are sender or receiver
CREATE POLICY messages_select_policy ON messages
  FOR SELECT
  USING (
    auth.uid()::text::integer = sender_id OR 
    auth.uid()::text::integer = receiver_id
  );

-- Users can insert messages where they are the sender
CREATE POLICY messages_insert_policy ON messages
  FOR INSERT
  WITH CHECK (auth.uid()::text::integer = sender_id);

-- Users can update their own sent messages
CREATE POLICY messages_update_policy ON messages
  FOR UPDATE
  USING (
    auth.uid()::text::integer = sender_id OR 
    auth.uid()::text::integer = receiver_id
  );

-- Users can delete their own sent messages
CREATE POLICY messages_delete_policy ON messages
  FOR DELETE
  USING (auth.uid()::text::integer = sender_id);
