-- Create contact_messages table for storing form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    subject TEXT DEFAULT 'general',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    replied_at TIMESTAMPTZ,
    notes TEXT
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Allow service role to insert (from Netlify function)
CREATE POLICY "Service role can insert contact messages" ON contact_messages
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Allow service role to read all messages
CREATE POLICY "Service role can read contact messages" ON contact_messages
    FOR SELECT
    TO service_role
    USING (true);
