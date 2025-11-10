-- Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update RLS policy to include avatar_url
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user\'s avatar image';
