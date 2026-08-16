import { useState } from 'react';
import { TrendingUp, PiggyBank, Receipt, Check } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Field, TextInput, NumberInput, DateInput, PrimaryButton } from '@/components/shared/FormControls';
import { useData } from '@/context/DataContext';
import { IncomeEntryType, ExpenseCategory } from '@/types';
import { todayISO, formatCurrency } from '@/lib/format';

type Tab = 'income' | 'savings' | 'expense';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultGoalId: string | null;
}

const incomeTypes: { value: IncomeEntryType; label: string }[] = [
  { value: 'salary', label: 'Salary' },
  { value: 'shift', label: 'Shift' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'other', label: 'Other' },
];

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: 'Food' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'housing', label: 'Housing' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'other', label: 'Other' },
];

export function AddActivityModal({ isOpen, onClose, defaultGoalId }: Props) {
  const { addIncomeEntry, addSavingsEntry, addExpense, mainGoal, dreamGoal } = useData();
  const [tab, setTab] = useState<Tab>('income');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(todayISO());

  // income
  const [incomeAmount, setIncomeAmount] = useState(0);
  const [incomeType, setIncomeType] = useState<IncomeEntryType>('salary');
  const [incomeNote, setIncomeNote] = useState('');

  // savings
  const [savingsAmount, setSavingsAmount] = useState(0);
  const [savingsGoalId, setSavingsGoalId] = useState<string | null>(defaultGoalId);
  const [savingsNote, setSavingsNote] = useState('');

  // expense
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('food');
  const [expenseNote, setExpenseNote] = useState('');

  const resetForm = () => {
    setIncomeAmount(0);
    setIncomeType('salary');
    setIncomeNote('');
    setSavingsAmount(0);
    setSavingsGoalId(defaultGoalId);
    setSavingsNote('');
    setExpenseAmount(0);
    setExpenseCategory('food');
    setExpenseNote('');
    setDate(todayISO());
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (tab === 'income') {
        if (incomeAmount <= 0) throw new Error('Please enter an amount.');
        await addIncomeEntry({ date, amount: incomeAmount, type: incomeType, note: incomeNote });
      } else if (tab === 'savings') {
        if (savingsAmount <= 0) throw new Error('Please enter an amount.');
        await addSavingsEntry({ date, amount: savingsAmount, goal_id: savingsGoalId, note: savingsNote });
      } else {
        if (expenseAmount <= 0) throw new Error('Please enter an amount.');
        await addExpense({ date, amount: expenseAmount, category: expenseCategory, note: expenseNote });
      }
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof TrendingUp }[] = [
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'expense', label: 'Expense', icon: Receipt },
  ];

  const goalOptions = [mainGoal, dreamGoal].filter(Boolean) as { id: string; name: string; kind: string }[];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add activity" maxWidthClass="max-w-lg">
      <div className="flex gap-2 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          const colorMap: Record<Tab, string> = {
            income: 'border-success-500 bg-success-50 text-success-700',
            savings: 'border-primary-500 bg-primary-50 text-primary-700',
            expense: 'border-error-500 bg-error-50 text-error-700',
          };
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                active ? colorMap[id] : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-5">
        <Field label="Date">
          <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        {tab === 'income' && (
          <>
            <Field label="How much did you earn?">
              <NumberInput value={incomeAmount || ''} onChange={setIncomeAmount} placeholder="0" />
            </Field>
            <Field label="Income type">
              <div className="grid grid-cols-4 gap-2">
                {incomeTypes.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIncomeType(opt.value)}
                    className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      incomeType === opt.value
                        ? 'border-success-500 bg-success-50 text-success-700'
                        : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Note (optional)">
              <TextInput value={incomeNote} onChange={(e) => setIncomeNote(e.target.value)} placeholder="e.g. March salary" />
            </Field>
          </>
        )}

        {tab === 'savings' && (
          <>
            <Field label="How much did you save?">
              <NumberInput value={savingsAmount || ''} onChange={setSavingsAmount} placeholder="0" />
            </Field>
            {goalOptions.length > 0 && (
              <Field label="Which goal does this count toward?">
                <select
                  value={savingsGoalId ?? ''}
                  onChange={(e) => setSavingsGoalId(e.target.value || null)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow text-sm"
                >
                  {goalOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.kind === 'main' ? 'Current Goal' : 'Long-term Dream'} — {g.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Note (optional)">
              <TextInput value={savingsNote} onChange={(e) => setSavingsNote(e.target.value)} placeholder="e.g. Weekly savings" />
            </Field>
          </>
        )}

        {tab === 'expense' && (
          <>
            <Field label="Amount">
              <NumberInput value={expenseAmount || ''} onChange={setExpenseAmount} placeholder="0" />
            </Field>
            <Field label="Category">
              <div className="grid grid-cols-4 gap-2">
                {expenseCategories.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExpenseCategory(opt.value)}
                    className={`px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      expenseCategory === opt.value
                        ? 'border-error-500 bg-error-50 text-error-700'
                        : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Note (optional)">
              <TextInput value={expenseNote} onChange={(e) => setExpenseNote(e.target.value)} placeholder="e.g. Groceries" />
            </Field>
          </>
        )}

        {error && (
          <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700">
            {error}
          </div>
        )}

        <PrimaryButton onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? 'Saving...' : 'Save activity'}
          {!submitting && <Check size={16} />}
        </PrimaryButton>
      </div>
    </Modal>
  );
}
