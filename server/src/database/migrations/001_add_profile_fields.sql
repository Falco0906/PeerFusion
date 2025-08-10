-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS institution VARCHAR(255),
ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);

-- Update the existing users table structure
COMMENT ON COLUMN users.bio IS 'User biography or description';
COMMENT ON COLUMN users.institution IS 'User institution or organization';
COMMENT ON COLUMN users.field_of_study IS 'User field of study or research area';
COMMENT ON COLUMN users.avatar IS 'URL to user avatar image';
