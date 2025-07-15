-- Fix RLS policies to properly filter by user_id
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;

-- Create proper RLS policies that filter by user_id using auth.uid()
CREATE POLICY "Users can view their own sessions" 
  ON public.sessions 
  FOR SELECT 
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own sessions" 
  ON public.sessions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own sessions" 
  ON public.sessions 
  FOR UPDATE 
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own sessions" 
  ON public.sessions 
  FOR DELETE 
  USING (user_id = auth.uid()::text); 