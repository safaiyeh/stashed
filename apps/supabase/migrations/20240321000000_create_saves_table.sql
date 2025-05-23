-- Create saves table
CREATE TABLE IF NOT EXISTS saves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    favicon_url TEXT,
    og_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS saves_user_id_idx ON saves(user_id);
CREATE INDEX IF NOT EXISTS saves_created_at_idx ON saves(created_at DESC);
CREATE INDEX IF NOT EXISTS saves_is_archived_idx ON saves(is_archived);
CREATE INDEX IF NOT EXISTS saves_is_favorite_idx ON saves(is_favorite);

-- Enable Row Level Security
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saves"
    ON saves FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saves"
    ON saves FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saves"
    ON saves FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
    ON saves FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saves_updated_at
    BEFORE UPDATE ON saves
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 