-- Create approver favorites table
CREATE TABLE public.approver_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  approver_name TEXT NOT NULL,
  approver_email TEXT NOT NULL,
  approver_role TEXT,
  times_used INTEGER DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, approver_id)
);

-- Enable RLS
ALTER TABLE public.approver_favorites ENABLE ROW LEVEL SECURITY;

-- Users can manage their own favorites
CREATE POLICY "Users can manage their own favorites"
ON public.approver_favorites
FOR ALL
USING (auth.uid() = user_id);

-- Enable realtime for assets table
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;

-- Enable realtime for comments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Enable realtime for timeline_events table
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;