import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Profile,
  Goal,
  GoalKind,
  Account,
  AccountType,
  IncomeEntry,
  IncomeEntryType,
  SavingsEntry,
  Expense,
  ExpenseCategory,
} from '@/types';

interface OnboardingGoalInput {
  name: string;
  target_amount: number;
  initial_saved: number;
  start_date: string;
  target_date: string;
}

interface OnboardingAccountInput {
  name: string;
  type: AccountType;
  balance: number;
  goal_id?: string | null;
}

interface OnboardingProfileInput {
  name: string;
  what_do_you_do: string;
  occupation: string;
  employment_type: string;
  income_type: string;
  income_amount: number;
}

interface DataContextValue {
  loading: boolean;
  profile: Profile | null;
  goals: Goal[];
  mainGoal: Goal | null;
  dreamGoal: Goal | null;
  accounts: Account[];
  incomeEntries: IncomeEntry[];
  savingsEntries: SavingsEntry[];
  expenses: Expense[];
  refetchAll: () => Promise<void>;
  completeOnboarding: (
    profileInput: OnboardingProfileInput,
    mainGoalInput: OnboardingGoalInput,
    dreamGoalInput: OnboardingGoalInput,
    accountInputs: OnboardingAccountInput[],
  ) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateGoal: (kind: GoalKind, updates: Partial<Goal>) => Promise<void>;
  addAccount: (input: OnboardingAccountInput) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  setAccountGoal: (accountId: string, goalId: string | null) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addIncomeEntry: (input: {
    date: string;
    amount: number;
    type: IncomeEntryType;
    note?: string;
  }) => Promise<void>;
  addSavingsEntry: (input: {
    date: string;
    amount: number;
    goal_id: string | null;
    note?: string;
  }) => Promise<void>;
  addExpense: (input: {
    date: string;
    amount: number;
    category: ExpenseCategory;
    note?: string;
  }) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [savingsEntries, setSavingsEntries] = useState<SavingsEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const refetchAll = useCallback(async () => {
    const [
      profileRes,
      goalsRes,
      accountsRes,
      incomeRes,
      savingsRes,
      expensesRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle(),
      supabase.from('goals').select('*'),
      supabase.from('accounts').select('*').order('created_at', { ascending: true }),
      supabase.from('income_entries').select('*').order('date', { ascending: false }),
      supabase.from('savings_entries').select('*').order('date', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false }),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (goalsRes.error) throw goalsRes.error;
    if (accountsRes.error) throw accountsRes.error;
    if (incomeRes.error) throw incomeRes.error;
    if (savingsRes.error) throw savingsRes.error;
    if (expensesRes.error) throw expensesRes.error;

    setProfile(profileRes.data ?? null);
    setGoals(goalsRes.data ?? []);
    setAccounts(accountsRes.data ?? []);
    setIncomeEntries(incomeRes.data ?? []);
    setSavingsEntries(savingsRes.data ?? []);
    setExpenses(expensesRes.data ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refetchAll();
      } finally {
        setLoading(false);
      }
    })();
  }, [refetchAll]);

  const completeOnboarding = useCallback(
    async (
      profileInput: OnboardingProfileInput,
      mainGoalInput: OnboardingGoalInput,
      dreamGoalInput: OnboardingGoalInput,
      accountInputs: OnboardingAccountInput[],
    ) => {
      const { error: profileError } = await supabase.from('profiles').insert({
        ...profileInput,
        onboarding_completed: true,
      });
      if (profileError) throw profileError;

      const { error: goalsError } = await supabase.from('goals').insert([
        { kind: 'main', ...mainGoalInput },
        { kind: 'dream', ...dreamGoalInput },
      ]);
      if (goalsError) throw goalsError;

      if (accountInputs.length > 0) {
        const { error: accountsError } = await supabase.from('accounts').insert(accountInputs);
        if (accountsError) throw accountsError;
      }

      await refetchAll();
    },
    [refetchAll],
  );

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!profile) return;
      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
      if (error) throw error;
      await refetchAll();
    },
    [profile, refetchAll],
  );

  const updateGoal = useCallback(
    async (kind: GoalKind, updates: Partial<Goal>) => {
      const goal = goals.find((g) => g.kind === kind);
      if (!goal) return;
      const { error } = await supabase.from('goals').update(updates).eq('id', goal.id);
      if (error) throw error;
      await refetchAll();
    },
    [goals, refetchAll],
  );

  const addAccount = useCallback(
    async (input: OnboardingAccountInput) => {
      const { error } = await supabase.from('accounts').insert(input);
      if (error) throw error;
      await refetchAll();
    },
    [refetchAll],
  );

  const updateAccount = useCallback(
    async (id: string, updates: Partial<Account>) => {
      const { error } = await supabase.from('accounts').update(updates).eq('id', id);
      if (error) throw error;
      await refetchAll();
    },
    [refetchAll],
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) throw error;
      await refetchAll();
    },
    [refetchAll],
  );

  const setAccountGoal = useCallback(
    async (accountId: string, goalId: string | null) => {
      const { error } = await supabase
        .from('accounts')
        .update({ goal_id: goalId })
        .eq('id', accountId);
      if (error) throw error;
      await refetchAll();
    },
    [refetchAll],
  );

  const addIncomeEntry = useCallback(
    async (input: { date: string; amount: number; type: IncomeEntryType; note?: string }) => {
      const { error } = await supabase.from('income_entries').insert({
        date: input.date,
        amount: input.amount,
        type: input.type,
        note: input.note ?? '',
      });
      if (error) throw error;
      await refetchAll();
    },
    [refetchAll],
  );

  const addSavingsEntry = useCallback(
    async (input: { date: string; amount: number; goal_id: string | null; note?: string }) => {
      const { error } = await supabase.from('savings_entries').insert({
        date: input.date,
        amount: input.amount,
        goal_id: input.goal_id,
        note: input.note ?? '',
      });
      if (error) throw error;
      await refetchAll();
    },
    [refetchAll],
  );

  const addExpense = useCallback(
    async (input: { date: string; amount: number; category: ExpenseCategory; note?: string }) => {
      const { error } = await supabase.from('expenses').insert({
        date: input.date,
        amount: input.amount,
        category: input.category,
        note: input.note ?? '',
      });
      if (error) throw error;
      await refetchAll();
    },
    [refetchAll],
  );

  const mainGoal = goals.find((g) => g.kind === 'main') ?? null;
  const dreamGoal = goals.find((g) => g.kind === 'dream') ?? null;

  return (
    <DataContext.Provider
      value={{
        loading,
        profile,
        goals,
        mainGoal,
        dreamGoal,
        accounts,
        incomeEntries,
        savingsEntries,
        expenses,
        refetchAll,
        completeOnboarding,
        updateProfile,
        updateGoal,
        addAccount,
        updateAccount,
        deleteAccount,
        setAccountGoal,
        addIncomeEntry,
        addSavingsEntry,
        addExpense,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
