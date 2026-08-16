/*
# Link accounts to goals

## Plain-English summary
Adds an optional `goal_id` column to the `accounts` table so that an account
can be linked to a savings goal. When linked, the account's balance counts
toward that goal's saved amount in addition to the user's total money. The
relationship is optional — an account with no `goal_id` simply contributes to
total money without affecting any goal. A goal can have multiple accounts
linked to it, and an account can only be linked to one goal at a time.

## Modified Tables
- `accounts`
  - New column: `goal_id` (uuid, nullable, references `goals(id)` with
    `ON DELETE SET NULL`). When the referenced goal is deleted, the account's
    `goal_id` becomes NULL automatically, so the account stays in total money
    but no longer counts toward any goal.

## Security
No policy changes needed — the `accounts` table already has full CRUD
policies for `anon, authenticated`. The new column inherits the same
updatable/insertable privileges as the rest of the table.
*/

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS goal_id uuid REFERENCES goals(id) ON DELETE SET NULL;
