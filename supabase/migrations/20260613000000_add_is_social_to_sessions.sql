-- Add explicit social flag to substance sessions.
-- A session is "social" when is_social = true OR participant_count > 1.
-- Existing rows default to false; multi-participant rows remain social via the OR rule.
ALTER TABLE public.sessions
  ADD COLUMN is_social boolean NOT NULL DEFAULT false;
