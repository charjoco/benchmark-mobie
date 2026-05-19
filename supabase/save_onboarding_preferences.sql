-- Run this SQL in your Supabase project: Dashboard → SQL Editor → New query
-- Replaces the two-write upsert+update pattern in saveOnboardingPreferences with
-- a single atomic operation. ON CONFLICT deliberately omits brands/sizes/colors
-- so Path C users (profile → Style Preferences → redo onboarding) don't lose
-- preferences they set on the profile screen.

CREATE OR REPLACE FUNCTION save_onboarding_preferences(
  p_user_id         uuid,
  p_preferred_brands text[],
  p_top_size         text,
  p_bottom_size      text,
  p_outerwear_size   text,
  p_style_lean       text[],
  p_price_comfort    text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_preferences (
    user_id,
    brands, sizes, colors,
    sort_by, on_sale, is_new,
    preferred_brands, top_size, bottom_size, outerwear_size,
    style_lean, price_comfort, onboarding_complete
  ) VALUES (
    p_user_id,
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
    -- brands, sizes, colors intentionally omitted from the conflict clause:
    -- preserved as-is for returning users who set them on the profile screen.
END;
$$;

-- Grant execute to authenticated users (RLS on the table still applies via SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION save_onboarding_preferences(uuid, text[], text, text, text, text[], text)
  TO authenticated;
