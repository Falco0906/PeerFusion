# Database Migrations for PeerFusion

This folder contains SQL migration files for setting up the PeerFusion database in Supabase.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file
4. Run them in this order:

```
1. create_publications_table.sql
2. create_messages_table.sql
```

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Migration Files

### `create_publications_table.sql`
Creates the publications table for storing user research publications.

**Features:**
- User publications with DOI, journal, conference info
- Citation tracking
- Publication types (article, conference, book, thesis, preprint)
- Featured publications flag
- Automatic timestamp updates

### `create_messages_table.sql`
Creates the messages table for chat functionality.

**Features:**
- Direct messaging between users
- Message types (text, image, file, etc.)
- Read/unread status tracking
- Automatic timestamp updates
- Row Level Security (RLS) policies
- Optimized indexes for performance

## Verification

After running migrations, verify they worked:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('publications', 'messages');

-- Check publications table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'publications';

-- Check messages table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages';
```

## Troubleshooting

### Error: "relation already exists"
The table already exists. You can either:
- Drop the table first: `DROP TABLE IF EXISTS table_name CASCADE;`
- Or skip this migration

### Error: "permission denied"
Make sure you're using the service role key or have proper permissions in Supabase.

### Error: "function does not exist"
Make sure to run the entire migration file, including the function definitions.

## Notes

- These migrations use PostgreSQL syntax (Supabase uses PostgreSQL)
- Row Level Security (RLS) is enabled for security
- Indexes are created for better query performance
- Triggers automatically update `updated_at` timestamps
