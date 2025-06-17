-- Add category column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN category TEXT NOT NULL DEFAULT 'weed' 
CHECK (category IN ('weed', 'cigs', 'vapes', 'liquor'));

-- Update session_type constraint to support all categories
ALTER TABLE public.sessions 
DROP CONSTRAINT sessions_session_type_check;

ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_session_type_check 
CHECK (session_type IN (
  -- Weed types
  'Joint', 'Bong', 'Vape', 'Edible', 'Other',
  -- Cigarette types  
  'Regular', 'Light', 'Menthol', 'E-Cigarette',
  -- Vape types
  'Disposable', 'Pod', 'Mod', 'Pen',
  -- Liquor types
  'Beer', 'Wine', 'Spirits', 'Cocktail'
));

-- Create index for category filtering
CREATE INDEX idx_sessions_category ON public.sessions(category);
CREATE INDEX idx_sessions_user_category ON public.sessions(user_id, category);

-- Update existing sessions to have 'weed' category (since they were all weed sessions)
UPDATE public.sessions SET category = 'weed' WHERE category = 'weed'; 