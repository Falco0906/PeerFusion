-- Create publications table for storing user research publications
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  authors TEXT,
  journal VARCHAR(255),
  conference VARCHAR(255),
  year INTEGER NOT NULL,
  doi VARCHAR(255),
  url TEXT,
  abstract TEXT,
  citation_count INTEGER DEFAULT 0,
  publication_type VARCHAR(50) DEFAULT 'article', -- article, conference, book, thesis, preprint
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_publications_user_id ON publications(user_id);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_featured ON publications(is_featured);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_publications_updated_at 
  BEFORE UPDATE ON publications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
