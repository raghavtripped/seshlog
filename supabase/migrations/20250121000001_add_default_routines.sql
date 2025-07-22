-- Add default routines for comprehensive life tracking
-- This migration will be run after user registration to provide default routines

-- Function to create default routines for a user
CREATE OR REPLACE FUNCTION create_default_routines_for_user(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Morning Health Check Routine
  INSERT INTO public.routines (user_id, name, items) VALUES
  (user_id_param, 'Morning Health Check', ARRAY[
    'Rate sleep quality (1-5 stars)',
    'Log wake time',
    'Check pain/stiffness level (0-10)',
    'Assess morning mood',
    'Drink first glass of water'
  ]);

  -- Daily Nutrition Tracking
  INSERT INTO public.routines (user_id, name, items) VALUES
  (user_id_param, 'Daily Nutrition Tracking', ARRAY[
    'Log breakfast meal composition',
    'Log lunch meal composition', 
    'Log dinner meal composition',
    'Rate meal satisfaction (1-10)',
    'Take meal photos (optional)'
  ]);

  -- Hydration Tracking
  INSERT INTO public.routines (user_id, name, items) VALUES
  (user_id_param, 'Daily Hydration Goals', ARRAY[
    'Morning: 2 glasses water',
    'Coffee/Tea intake',
    'Midday: 2 glasses water',
    'Afternoon: 1 glass water',
    'Evening: 1 glass water',
    'Track total daily intake'
  ]);

  -- Work Productivity Session
  INSERT INTO public.routines (user_id, name, items) VALUES
  (user_id_param, 'Work Session Tracking', ARRAY[
    'Set session duration goal',
    'Rate focus level before starting',
    'Log work type/project',
    'Rate focus level after session',
    'Note any distractions or insights'
  ]);

  -- Physical Activity Routine  
  INSERT INTO public.routines (user_id, name, items) VALUES
  (user_id_param, 'Daily Activity Log', ARRAY[
    'Morning movement/stretch',
    'Planned workout or activity',
    'Log activity type and duration',
    'Rate energy level before/after',
    'Note how body feels'
  ]);

  -- Evening Wind-Down Routine
  INSERT INTO public.routines (user_id, name, items) VALUES
  (user_id_param, 'Evening Wind-Down', ARRAY[
    'Brush teeth',
    'Wash face',
    'Take evening supplements',
    'Reflect on day highlights',
    'Rate final pain/mood/energy levels',
    'Set tomorrow intention'
  ]);

  -- Weekly Reflection Routine
  INSERT INTO public.routines (user_id, name, items) VALUES
  (user_id_param, 'Weekly Health Review', ARRAY[
    'Review sleep quality trends',
    'Assess pain patterns vs activity',
    'Check hydration consistency', 
    'Evaluate mood patterns',
    'Plan improvements for next week'
  ]);

END;
$$;

-- Function to automatically create default routines for new users
-- This can be called from a trigger or manually when users sign up
CREATE OR REPLACE FUNCTION handle_new_user_routines()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create default routines for the new user
  PERFORM create_default_routines_for_user(NEW.id);
  RETURN NEW;
END;
$$;

-- Optional: Create trigger to auto-create routines for new users
-- Uncomment if you want automatic routine creation on user registration
-- CREATE TRIGGER on_auth_user_created_routines
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user_routines(); 