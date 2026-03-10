-- Talreo: categories, transactions, RLS, default categories seed
-- Run after 002_profiles_extend.sql

-- 1. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type, name)
);

CREATE INDEX idx_categories_user_type ON public.categories(user_id, type);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  note TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Seed default categories when profile is created
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Expense categories
  INSERT INTO public.categories (user_id, name, type) VALUES
    (NEW.id, 'Food', 'expense'),
    (NEW.id, 'Transport', 'expense'),
    (NEW.id, 'Bills', 'expense'),
    (NEW.id, 'Entertainment', 'expense'),
    (NEW.id, 'Shopping', 'expense');
  -- Income categories
  INSERT INTO public.categories (user_id, name, type) VALUES
    (NEW.id, 'Salary', 'income'),
    (NEW.id, 'Freelance', 'income'),
    (NEW.id, 'Other income', 'income');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_seed_categories ON public.profiles;

CREATE TRIGGER on_profile_created_seed_categories
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_categories();

-- 4. Seed categories for existing profiles (one-time, for users created before this migration)
INSERT INTO public.categories (user_id, name, type)
SELECT p.id, c.name, c.type
FROM public.profiles p
CROSS JOIN (VALUES
  ('Food', 'expense'),
  ('Transport', 'expense'),
  ('Bills', 'expense'),
  ('Entertainment', 'expense'),
  ('Shopping', 'expense'),
  ('Salary', 'income'),
  ('Freelance', 'income'),
  ('Other income', 'income')
) AS c(name, type)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories cat
  WHERE cat.user_id = p.id AND cat.name = c.name AND cat.type = c.type
);
