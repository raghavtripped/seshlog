-- Nicotine gum joins the tracked categories.
--
-- `category` is the session_category enum, so the change is a single added
-- label. `session_type` is plain text with no constraint, which is where the
-- piece strength ('2mg', '4mg', '6mg') rides: keeping strength in the type
-- rather than a new column means milligram intake stays derivable from a row on
-- its own, and no other category grows a column it will never use.
--
-- Adding an enum label is additive and leaves every existing row untouched, but
-- it is one-way: Postgres cannot drop a label without recreating the type.

ALTER TYPE public.session_category ADD VALUE IF NOT EXISTS 'gum';
