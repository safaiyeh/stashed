-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, name)
);

-- Create saves_tags junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS saves_tags (
    save_id UUID REFERENCES saves(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (save_id, tag_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);
CREATE INDEX IF NOT EXISTS tags_name_idx ON tags(name);
CREATE INDEX IF NOT EXISTS saves_tags_save_id_idx ON saves_tags(save_id);
CREATE INDEX IF NOT EXISTS saves_tags_tag_id_idx ON saves_tags(tag_id);

-- Enable Row Level Security
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags
CREATE POLICY "Users can view their own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for saves_tags
CREATE POLICY "Users can view their own saves_tags"
    ON saves_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM saves
            WHERE saves.id = saves_tags.save_id
            AND saves.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own saves_tags"
    ON saves_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM saves
            WHERE saves.id = saves_tags.save_id
            AND saves.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own saves_tags"
    ON saves_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM saves
            WHERE saves.id = saves_tags.save_id
            AND saves.user_id = auth.uid()
        )
    ); 