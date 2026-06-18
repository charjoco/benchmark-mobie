-- Run this in Supabase Dashboard → SQL Editor → New query
-- Fixes a privilege-escalation hole: the original function accepted p_user_id from
-- the client and wrote it directly to the table inside a SECURITY DEFINER context,
-- letting any authenticated caller overwrite another user's row by supplying a
-- different UUID.  This version derives user_id from auth.uid() instead.
--
-- Run AFTER fix_rls_policies.sql.

-- 1. Drop the old 7-parameter signature (keeps Postgres from leaving both coexisting)
DROP FUNCTION IF EXISTS save_onboarding_preferences(
  uuid, text[], text, text, text, text[], text
);

-- 2. New 6-parameter function — no client-supplied user_id
CREATE OR REPLACE FUNCTION save_onboarding_preferences(
  p_preferred_brands  text[],
  p_top_size          text,
  p_bottom_size       text,
  p_outerwear_size    text,
  p_style_lean        text[],
  p_price_comfort     text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public          -- prevents search_path injection
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO user_preferences (
    user_id,
    brands, sizes, colors,
    sort_by, on_sale, is_new,
    preferred_brands, top_size, bottom_size, outerwear_size,
    style_lean, price_comfort, onboarding_complete
  ) VALUES (
    v_user_id,
    '{}', '{}', '{}',
    'lastSeenAt', false, false,
    p_preferred_brands, p_top_size, p_bottom_size, p_outerwear_size,
    p_style_lean, p_price_comfort, true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    preferred_brands    = EXCLUDED.preferred_brands,
    top_size            = EXCLUDED.top_size,
    bottom_size         = EXCLUDED.bottom_size,
    outerwear_size      = EXCLUDED.outerwear_size,
    style_lean          = EXCLUDED.style_lean,
    price_comfort       = EXCLUDED.price_comfort,
    onboarding_complete = true;
    -- brands / sizes / colors intentionally omitted: preserved for returning users
    -- who set them on the profile screen before re-doing onboarding.
END;
$$;

-- 3. Grant execute on new signature to authenticated users
GRANT EXECUTE ON FUNCTION save_onboarding_preferences(
  text[], text, text, text, text[], text
) TO authenticated;
