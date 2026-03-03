-- ============================================
-- MoneyTrackr - Complete Database Setup (Hybrid)
-- Copy this entire file into Supabase SQL Editor and click "Run"
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CORE TABLES
-- ============================================

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text,
  avatar_url text,
  currency text DEFAULT 'USD',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount decimal(12,2) NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  payment_method text,
  source text,
  merchant text,
  notes text,
  recurring boolean DEFAULT false,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_amount decimal(12,2) NOT NULL,
  current_amount decimal(12,2) DEFAULT 0,
  deadline date NOT NULL,
  category text NOT NULL CHECK (category IN ('savings', 'expense-limit', 'income-target')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL CHECK (status IN ('active', 'completed', 'paused')),
  target_category text,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- 2. HYBRID REFERENCE TABLES (Currencies & Categories)
-- ============================================

-- Currencies (global defaults + user custom)
CREATE TABLE IF NOT EXISTS currencies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL,
  symbol text NOT NULL,
  name text NOT NULL,
  rate decimal(18,6) NOT NULL DEFAULT 1.0,
  decimal_places integer NOT NULL DEFAULT 2,
  is_default boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(code, user_id)
);

-- Categories (global defaults + user custom)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income', 'goal')),
  description text,
  icon text,
  color text,
  sort_order integer DEFAULT 0,
  is_default boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment Methods (global defaults + user custom)
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  icon text,
  sort_order integer DEFAULT 0,
  is_default boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Income Sources (global defaults + user custom)
CREATE TABLE IF NOT EXISTS income_sources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  icon text,
  sort_order integer DEFAULT 0,
  is_default boolean DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- goals policies
CREATE POLICY "Users can view own goals" ON goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- currencies policies (user can see defaults + own custom)
CREATE POLICY "Anyone can view default currencies" ON currencies FOR SELECT TO authenticated USING (is_default = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own currencies" ON currencies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_default = false);
CREATE POLICY "Users can update own currencies" ON currencies FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_default = false) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own currencies" ON currencies FOR DELETE TO authenticated USING (auth.uid() = user_id AND is_default = false);

-- categories policies (user can see defaults + own custom)
CREATE POLICY "Anyone can view default categories" ON categories FOR SELECT TO authenticated USING (is_default = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_default = false);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_default = false) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE TO authenticated USING (auth.uid() = user_id AND is_default = false);

-- payment_methods policies (user can see defaults + own custom)
CREATE POLICY "Anyone can view default payment methods" ON payment_methods FOR SELECT TO authenticated USING (is_default = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own payment methods" ON payment_methods FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_default = false);
CREATE POLICY "Users can update own payment methods" ON payment_methods FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_default = false) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own payment methods" ON payment_methods FOR DELETE TO authenticated USING (auth.uid() = user_id AND is_default = false);

-- income_sources policies (user can see defaults + own custom)
CREATE POLICY "Anyone can view default income sources" ON income_sources FOR SELECT TO authenticated USING (is_default = true OR user_id = auth.uid());
CREATE POLICY "Users can insert own income sources" ON income_sources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND is_default = false);
CREATE POLICY "Users can update own income sources" ON income_sources FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_default = false) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own income sources" ON income_sources FOR DELETE TO authenticated USING (auth.uid() = user_id AND is_default = false);

-- ============================================
-- 4. AUTO-UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON currencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON income_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_currencies_default ON currencies(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_default ON categories(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_income_sources_default ON income_sources(is_default) WHERE is_default = true;

-- ============================================
-- 6. SEED DATA - Default Currencies (from currency.ts)
-- ============================================

INSERT INTO currencies (code, symbol, name, rate, decimal_places, is_default, user_id) VALUES
  ('USD', '$',  'US Dollar',          1.0,     2, true, NULL),
  ('EUR', '€',  'Euro',               0.85,    2, true, NULL),
  ('GBP', '£',  'British Pound',      0.73,    2, true, NULL),
  ('JPY', '¥',  'Japanese Yen',       110.0,   0, true, NULL),
  ('IDR', 'Rp', 'Indonesian Rupiah',  15000.0, 0, true, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. SEED DATA - Default Expense Categories (from ExpenseForm.tsx)
-- ============================================

INSERT INTO categories (name, type, description, icon, sort_order, is_default, user_id) VALUES
  ('Food & Dining',    'expense', 'Restaurants, groceries, takeout',       '🍔', 1,  true, NULL),
  ('Transportation',   'expense', 'Gas, public transit, ride shares',      '🚗', 2,  true, NULL),
  ('Housing',          'expense', 'Rent, mortgage, home maintenance',      '🏠', 3,  true, NULL),
  ('Entertainment',    'expense', 'Movies, games, subscriptions',          '🎬', 4,  true, NULL),
  ('Utilities',        'expense', 'Electric, water, internet',             '💡', 5,  true, NULL),
  ('Healthcare',       'expense', 'Doctor visits, medicine, insurance',    '🏥', 6,  true, NULL),
  ('Shopping',         'expense', 'Clothing, electronics, personal items', '🛍️', 7,  true, NULL),
  ('Education',        'expense', 'Tuition, courses, books',               '📚', 8,  true, NULL),
  ('Other',            'expense', 'Miscellaneous expenses',                '📦', 9,  true, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. SEED DATA - Default Income Categories (from IncomeForm.tsx)
-- ============================================

INSERT INTO categories (name, type, description, icon, sort_order, is_default, user_id) VALUES
  ('Employment',  'income', 'Regular job salary and wages',    '💼', 1, true, NULL),
  ('Freelance',   'income', 'Freelance and contract work',     '💻', 2, true, NULL),
  ('Investment',  'income', 'Stocks, dividends, interest',     '📈', 3, true, NULL),
  ('Business',    'income', 'Business revenue and profits',    '🏢', 4, true, NULL),
  ('Allowance',   'income', 'Regular allowance payments',      '💰', 5, true, NULL),
  ('Gifts',       'income', 'Monetary gifts received',         '🎁', 6, true, NULL),
  ('Other',       'income', 'Miscellaneous income',            '📦', 7, true, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. SEED DATA - Default Goal Categories (from GoalForm.tsx)
-- ============================================

INSERT INTO categories (name, type, description, icon, sort_order, is_default, user_id) VALUES
  ('savings',       'goal', 'Save money for something specific',      '🎯', 1, true, NULL),
  ('expense-limit', 'goal', 'Set spending limits for categories',     '🚫', 2, true, NULL),
  ('income-target', 'goal', 'Set income goals to achieve',            '📊', 3, true, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. SEED DATA - Default Payment Methods (from ExpenseForm.tsx)
-- ============================================

INSERT INTO payment_methods (name, icon, sort_order, is_default, user_id) VALUES
  ('Cash',           '💵', 1, true, NULL),
  ('Credit Card',    '💳', 2, true, NULL),
  ('Debit Card',     '🏧', 3, true, NULL),
  ('Digital Wallet', '📱', 4, true, NULL),
  ('Bank Transfer',  '🏦', 5, true, NULL),
  ('Other',          '📦', 6, true, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. SEED DATA - Default Income Sources (from IncomeForm.tsx)
-- ============================================

INSERT INTO income_sources (name, icon, sort_order, is_default, user_id) VALUES
  ('Salary',     '💼', 1, true, NULL),
  ('Freelance',  '💻', 2, true, NULL),
  ('Investment', '📈', 3, true, NULL),
  ('Business',   '🏢', 4, true, NULL),
  ('Allowance',  '💰', 5, true, NULL),
  ('Gifts',      '🎁', 6, true, NULL),
  ('Commission', '🤝', 7, true, NULL),
  ('Bonus',      '🎉', 8, true, NULL),
  ('Other',      '📦', 9, true, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- Done! All tables, policies, and seed data created.
-- 
-- Tables created:
--   Core:      user_profiles, transactions, goals, user_settings
--   Reference: currencies, categories, payment_methods, income_sources
--
-- Hybrid model:
--   - Default rows (is_default=true, user_id=NULL) are visible to all users
--   - Users can add custom rows (is_default=false, user_id=their_id)
--   - Users cannot edit/delete default rows
-- ============================================
