import type { Database } from '@/integrations/supabase/types';

type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

// Columns an edit must never send. user_id is the important one: the UPDATE
// RLS policy has WITH CHECK (user_id = auth.uid()::text), so including a
// user_id that isn't the caller's own uid makes Postgres reject the row.
const NON_EDITABLE_COLUMNS = ['user_id', 'id', 'created_at', 'updated_at'] as const;

/**
 * Builds the payload sent to `sessions.update()`, keeping only columns an edit
 * is allowed to change and normalizing session_date to ISO.
 */
export const buildSessionUpdatePayload = (updatedData: SessionUpdate): SessionUpdate => {
  const payload: SessionUpdate = { ...updatedData };

  for (const column of NON_EDITABLE_COLUMNS) {
    delete payload[column];
  }

  if (payload.session_date) {
    payload.session_date = new Date(payload.session_date).toISOString();
  }

  return payload;
};
