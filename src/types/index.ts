export type Page = 'dashboard' | 'goals' | 'money' | 'history' | 'profile' | 'settings';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'freelance'
  | 'self_employed'
  | 'shift_work'
  | 'student_and_work'
  | 'other';

export type IncomeType = 'monthly_salary' | 'per_shift' | 'irregular' | 'mixed';

export interface Profile {
  id: string;
  name: string;
  what_do_you_do: string;
  occupation: string;
  employment_type: EmploymentType | '';
  income_type: IncomeType | '';
  income_amount: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type GoalKind = 'main' | 'dream';

export interface Goal {
  id: string;
  kind: GoalKind;
  name: string;
  target_amount: number;
  initial_saved: number;
  start_date: string;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export type AccountType = 'bank' | 'debit_card' | 'savings' | 'cash' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  goal_id: string | null;
  created_at: string;
  updated_at: string;
}

export type IncomeEntryType = 'salary' | 'shift' | 'freelance' | 'other';

export interface IncomeEntry {
  id: string;
  date: string;
  amount: number;
  type: IncomeEntryType;
  note: string;
  created_at: string;
}

export interface SavingsEntry {
  id: string;
  date: string;
  amount: number;
  goal_id: string | null;
  note: string;
  created_at: string;
}

export type ExpenseCategory =
  | 'food'
  | 'transportation'
  | 'housing'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'other';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  created_at: string;
}
