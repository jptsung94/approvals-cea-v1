-- Fix RLS policy for profiles table to require authentication
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix RLS policy for timeline_events to restrict INSERT to authenticated users only
DROP POLICY IF EXISTS "System can create timeline events" ON public.timeline_events;

CREATE POLICY "Authenticated users can create timeline events"
ON public.timeline_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = actor_id);