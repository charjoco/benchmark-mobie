-- Run this SQL in your Supabase project: Dashboard → SQL Editor → New query

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  brands       text[]    DEFAULT '{}',
  sizes        text[]    DEFAULT '{}',
  colors       text[]    DEFAULT '{}',
  sort_by      text      DEFAULT 'lastSeenAt',
  on_sale      boolean   DEFAULT false,
  is_new       boolean   DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Saved products (save + watch)
CREATE TABLE IF NOT EXISTS public.saved_products (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand       text        NOT NULL,
  external_id text        NOT NULL,
  is_watching boolean     NOT NULL DEFAULT false,
  saved_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, brand, external_id)
);

ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved products"
  ON public.saved_products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
