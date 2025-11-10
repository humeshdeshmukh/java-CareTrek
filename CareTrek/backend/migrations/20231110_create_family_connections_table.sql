-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create family_connections table
CREATE TABLE IF NOT EXISTS public.family_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    senior_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL CHECK (relationship IN ('child', 'spouse', 'sibling', 'caregiver', 'other')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    permissions JSONB NOT NULL DEFAULT '{
        "view_health": true,
        "view_medications": true,
        "view_appointments": true,
        "view_location": true,
        "receive_notifications": true,
        "manage_medications": false,
        "manage_appointments": false
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure we don't have duplicate connections
    UNIQUE(senior_id, family_member_id)
);

-- Enable RLS
ALTER TABLE public.family_connections ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_family_connections_senior_id ON public.family_connections(senior_id);
CREATE INDEX IF NOT EXISTS idx_family_connections_family_member_id ON public.family_connections(family_member_id);
CREATE INDEX IF NOT EXISTS idx_family_connections_status ON public.family_connections(status);

-- RLS Policies
-- Users can view their own connections (both as senior and family member)
CREATE POLICY "Users can view their own connections"
    ON public.family_connections
    FOR SELECT
    TO authenticated
    USING (auth.uid() = senior_id OR auth.uid() = family_member_id);

-- Users can insert their own connection requests
CREATE POLICY "Users can create connection requests"
    ON public.family_connections
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = family_member_id);

-- Users can update their own connection requests
CREATE POLICY "Users can update their own connections"
    ON public.family_connections
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = senior_id OR auth.uid() = family_member_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own connections"
    ON public.family_connections
    FOR DELETE
    TO authenticated
    USING (auth.uid() = senior_id OR auth.uid() = family_member_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on update
DROP TRIGGER IF EXISTS update_family_connections_updated_at ON public.family_connections;
CREATE TRIGGER update_family_connections_updated_at
BEFORE UPDATE ON public.family_connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a view for easier querying of family connections with user details
CREATE OR REPLACE VIEW public.family_connections_view AS
SELECT 
    fc.*,
    senior.email as senior_email,
    senior.raw_user_meta_data->>'full_name' as senior_name,
    senior.raw_user_meta_data->'avatar_url' as senior_avatar,
    family_member.email as family_member_email,
    family_member.raw_user_meta_data->>'full_name' as family_member_name,
    family_member.raw_user_meta_data->'avatar_url' as family_member_avatar
FROM 
    family_connections fc
    JOIN auth.users senior ON fc.senior_id = senior.id
    JOIN auth.users family_member ON fc.family_member_id = family_member.id;

-- Create a policy to allow access to the view
CREATE POLICY "Allow access to family_connections_view"
    ON public.family_connections_view
    FOR SELECT
    TO authenticated
    USING (auth.uid() = senior_id OR auth.uid() = family_member_id);
