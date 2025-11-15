-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    media_types JSONB DEFAULT '[]'::jsonb,
    voice_transcript TEXT,
    location JSONB,
    tags TEXT[],
    anonymity BOOLEAN DEFAULT TRUE,
    contact_info TEXT,
    source TEXT DEFAULT 'web',
    status TEXT DEFAULT 'new',
    assigned_to UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Add a trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to columns for clarity
COMMENT ON COLUMN submissions.id IS 'Unique identifier for each submission';
COMMENT ON COLUMN submissions.title IS 'Title of the submission';
COMMENT ON COLUMN submissions.description IS 'Detailed description of the incident';
COMMENT ON COLUMN submissions.media_urls IS 'JSON array of public URLs for uploaded media files';
COMMENT ON COLUMN submissions.media_types IS 'JSON array of MIME types for uploaded media files';
COMMENT ON COLUMN submissions.voice_transcript IS 'Transcript of any uploaded audio file (TODO: Whisper integration)';
COMMENT ON COLUMN submissions.location IS 'GeoJSON object with lat, lng, and place_name';
COMMENT ON COLUMN submissions.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN submissions.anonymity IS 'Flag indicating if the submission is anonymous';
COMMENT ON COLUMN submissions.contact_info IS 'Optional contact information if not anonymous';
COMMENT ON COLUMN submissions.source IS 'Source of the submission (e.g., web, mobile)';
COMMENT ON COLUMN submissions.status IS 'Current status of the submission (e.g., new, verified, rejected)';
COMMENT ON COLUMN submissions.assigned_to IS 'UUID of the admin/user assigned to this submission';
COMMENT ON COLUMN submissions.created_at IS 'Timestamp of when the submission was created';
COMMENT ON COLUMN submissions.updated_at IS 'Timestamp of when the submission was last updated';
