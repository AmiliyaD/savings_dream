/*
# Dream Savings — core schema

## Plain-English summary
This migration creates the entire data model for the Dream Savings app: the
user's profile (set up during onboarding), their two goals (a "main" goal
they're actively working toward and a "dream" long-term goal), their money
accounts, and their day-to-day financial activity (income earned, amounts
saved, and expenses). This is a single-user desktop app with no sign-in
screen, so every table is readable/writable by the app itself (the `anon`
role) rather than scoped to a particular authenticated user.

## New Tables

1. `profiles`
   - `id` (uuid, primary key)
   - `name` (text) — the user's name
   - `what_do_you_do` (text) — free-text description of what they do
   - `occupation` (text)
   - `employment_type` (text) — full_time, part_time, freelance, self_employed, shift_work, student_and_work, other
   - `income_type` (text) — monthly_salary, per_shift, irregular, mixed
   - `income_amount` (numeric) — typical income for the chosen income type
   - `onboarding_completed` (boolean) — whether the first-launch flow has been finished
   - `created_at`, `updated_at` (timestamptz)

2. `goals`
   - `id` (uuid, primary key)
   - `kind` (text) — 'main' or 'dream'
   - `name` (text) — e.g. "Save 200,000 ₽"
   - `target_amount` (numeric)
   - `initial_saved` (numeric) — amount already saved at the time the goal was created
   - `start_date` (date)
   - `target_date` (date)
   - `created_at`, `updated_at` (timestamptz)

3. `accounts`
   - `id` (uuid, primary key)
   - `name` (text)
   - `type` (text) — bank, debit_card, savings, cash, other
   - `balance` (numeric)
   - `created_at`, `updated_at` (timestamptz)

4. `income_entries`
   - `id` (uuid, primary key)
   - `date` (date) — the day the income was earned
   - `amount` (numeric)
   - `type` (text) — salary, shift, freelance, other
   - `note` (text, optional)
   - `created_at` (timestamptz)

5. `savings_entries`
   - `id` (uuid, primary key)
   - `date` (date) — the day the saving happened
   - `amount` (numeric)
   - `goal_id` (uuid, references `goals`) — which goal this saving counts toward
   - `note` (text, optional)
   - `created_at` (timestamptz)

6. `expenses`
   - `id` (uuid, primary key)
   - `date` (date) — the day the expense happened
   - `amount` (numeric)
   - `category` (text) — food, transportation, housing, shopping, entertainment, health, education, other
   - `note` (text, optional)
   - `created_at` (timestamptz)

## Security
Row Level Security is enabled on every table above. Because this app has no
login screen, all data is accessed using the shared `anon` key, so each
table has 4 explicit policies (select/insert/update/delete) granted to
`anon, authenticated` with `USING (true)` / `WITH CHECK (true)`. This is
intentional for a single-tenant, no-auth desktop app — there is no other
user's data to isolate from.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  what_do_you_do text NOT NULL DEFAULT '',
  occupation text NOT NULL DEFAULT '',
  employment_type text NOT NULL DEFAULT '',
  income_type text NOT NULL DEFAULT '',
  income_amount numeric NOT NULL DEFAULT 0,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('main', 'dream')),
  name text NOT NULL DEFAULT '',
  target_amount numeric NOT NULL DEFAULT 0,
  initial_saved numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT current_date,
  target_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('bank', 'debit_card', 'savings', 'cash', 'other')),
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS income_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT current_date,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('salary', 'shift', 'freelance', 'other')),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS savings_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT current_date,
  amount numeric NOT NULL,
  goal_id uuid REFERENCES goals(id) ON DELETE SET NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT current_date,
  amount numeric NOT NULL,
  category text NOT NULL CHECK (category IN ('food', 'transportation', 'housing', 'shopping', 'entertainment', 'health', 'education', 'other')),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_income_entries_date ON income_entries (date);
CREATE INDEX IF NOT EXISTS idx_savings_entries_date ON savings_entries (date);
CREATE INDEX IF NOT EXISTS idx_savings_entries_goal_id ON savings_entries (goal_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_goals" ON goals;
CREATE POLICY "anon_select_goals" ON goals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
CREATE POLICY "anon_insert_goals" ON goals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
CREATE POLICY "anon_delete_goals" ON goals FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_accounts" ON accounts;
CREATE POLICY "anon_select_accounts" ON accounts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_accounts" ON accounts;
CREATE POLICY "anon_insert_accounts" ON accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_accounts" ON accounts;
CREATE POLICY "anon_update_accounts" ON accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_accounts" ON accounts;
CREATE POLICY "anon_delete_accounts" ON accounts FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_income_entries" ON income_entries;
CREATE POLICY "anon_select_income_entries" ON income_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_income_entries" ON income_entries;
CREATE POLICY "anon_insert_income_entries" ON income_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_income_entries" ON income_entries;
CREATE POLICY "anon_update_income_entries" ON income_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_income_entries" ON income_entries;
CREATE POLICY "anon_delete_income_entries" ON income_entries FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_savings_entries" ON savings_entries;
CREATE POLICY "anon_select_savings_entries" ON savings_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_savings_entries" ON savings_entries;
CREATE POLICY "anon_insert_savings_entries" ON savings_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_savings_entries" ON savings_entries;
CREATE POLICY "anon_update_savings_entries" ON savings_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_savings_entries" ON savings_entries;
CREATE POLICY "anon_delete_savings_entries" ON savings_entries FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE TO anon, authenticated USING (true);
