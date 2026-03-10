-- Talreo: extend profiles with onboarding, avatar, currency
-- Run after 001_profiles_and_rls.sql
-- full_name already exists in 001

-- Add columns (idempotent: use IF NOT EXISTS where supported)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'PLN';

-- Constrain currency to supported values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_currency_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_currency_check CHECK (currency IN ('PLN', 'EUR', 'USD'));

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'True after user completes onboarding form.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Optional profile image URL.';
COMMENT ON COLUMN public.profiles.currency IS 'Preferred currency: PLN, EUR, USD.';
