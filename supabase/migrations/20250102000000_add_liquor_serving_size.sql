-- Add liquor serving size column to sessions table
ALTER TABLE sessions 
ADD COLUMN liquor_serving_size TEXT;

-- Add constraint for valid liquor serving sizes
ALTER TABLE sessions 
ADD CONSTRAINT sessions_liquor_serving_size_check 
CHECK (
  liquor_serving_size IS NULL OR 
  liquor_serving_size IN (
    '30ml (Shot)',
    '60ml (Double Shot)', 
    '150ml (Wine Glass)',
    '250ml (Large Wine)',
    '330ml (Beer Bottle)',
    '500ml (Pint)',
    '750ml (Wine Bottle)',
    '1000ml (Large Bottle)',
    'Custom'
  )
);

-- Update existing liquor sessions to have a default serving size
UPDATE sessions 
SET liquor_serving_size = '330ml (Beer Bottle)'
WHERE category = 'liquor' AND liquor_serving_size IS NULL;

-- Add index for better query performance
CREATE INDEX idx_sessions_liquor_serving_size ON sessions(liquor_serving_size) 
WHERE category = 'liquor'; 