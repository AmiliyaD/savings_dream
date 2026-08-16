import { useState, useMemo } from 'react';
import { Target, Star, Edit2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Modal } from '@/components/shared/Modal';
import { Field, TextInput, NumberInput, DateInput, PrimaryButton, SecondaryButton } from '@/components/shared/FormControls';
import { getGoalProgress, statusMessage, GoalStatus } from '@/lib/calculations';
import { formatCurrency, formatDateLong } from '@/lib/format';
import { Goal, GoalKind } from '@/types';

const statusColor: Record<GoalStatus, string> = {
  completed: 'text-success-600',
  ahead: 'text-secondary-600',
  on_track: 'text-primary-600',
  behind: 'text-warning-600',
};

export function GoalsPage() {
  const { mainGoal, dreamGoal, savingsEntries, accounts, updateGoal } = useData();
  const [editing, setEditing] = useState<GoalKind | null>(null);

  const mainSavings = useMemo(
    () => savingsEntries.filter((s) => s.goal_id === mainGoal?.id).reduce((sum, s) => sum + s.amount, 0)
      + accounts.filter((a) => a.goal_id === mainGoal?.id).reduce((sum, a) => sum + a.balance, 0),
    [savingsEntries, accounts, mainGoal],
  );
  const dreamSavings = useMemo(
    () => savingsEntries.filter((s) => s.goal_id === dreamGoal?.id).reduce((sum, s) => sum + s.amount, 0)
      + accounts.filter((a) => a.goal_id === dreamGoal?.id).reduce((sum, a) => sum + a.balance, 0),
    [savingsEntries, accounts, dreamGoal],
  );

  const mainProgress = mainGoal ? getGoalProgress(mainGoal, mainSavings) : null;
  const dreamProgress = dreamGoal ? getGoalProgress(dreamGoal, dreamSavings) : null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Main Goal */}
      {mainGoal && mainProgress && (
        <div className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">Current Goal</span>
            </div>
            <button
              onClick={() => setEditing('main')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
            >
              <Edit2 size={14} />
              Edit
            </button>
          </div>

          <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">{mainGoal.name}</h2>

          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-3xl font-display font-bold text-neutral-900 tabular-money">
              {formatCurrency(mainProgress.currentSaved)}
            </span>
            <span className="text-lg text-neutral-400 tabular-money">/ {formatCurrency(mainGoal.target_amount)}</span>
          </div>

          <ProgressBar percent={mainProgress.progressPercent} heightClass="h-4" />

          <div className="flex items-center justify-between mt-3 mb-6">
            <span className="text-sm font-semibold text-primary-600 tabular-money">{mainProgress.progressPercent.toFixed(2)}% complete</span>
            <span className="text-sm text-neutral-500 tabular-money">{formatCurrency(mainProgress.remaining)} remaining</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-neutral-400" />
                <span className="text-xs text-neutral-400">Target date</span>
              </div>
              <span className="text-sm font-medium text-neutral-700">{formatDateLong(mainGoal.target_date)}</span>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-neutral-400" />
                <span className="text-xs text-neutral-400">Required monthly savings</span>
              </div>
              <span className="text-sm font-semibold text-neutral-900 tabular-money">~{formatCurrency(mainProgress.requiredMonthly)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className={`text-sm font-medium ${statusColor[mainProgress.status]}`}>
              {statusMessage(mainProgress.status)}
            </span>
          </div>
        </div>
      )}

      {/* Dream Goal - smaller */}
      {dreamGoal && dreamProgress && (
        <div className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-7">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-secondary-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Long-Term Dream</span>
            </div>
            <button
              onClick={() => setEditing('dream')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
            >
              <Edit2 size={14} />
              Edit
            </button>
          </div>

          <h3 className="text-xl font-display font-semibold text-neutral-900 mb-4">{dreamGoal.name}</h3>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-display font-bold text-neutral-900 tabular-money">
              {formatCurrency(dreamProgress.currentSaved)}
            </span>
            <span className="text-sm text-neutral-400 tabular-money">/ {formatCurrency(dreamGoal.target_amount)}</span>
          </div>

          <ProgressBar percent={dreamProgress.progressPercent} colorClass="bg-secondary-400" heightClass="h-3" />

          <div className="grid grid-cols-3 gap-4 mt-5">
            <div>
              <span className="block text-xs text-neutral-400 mb-0.5">Progress</span>
              <span className="text-sm font-medium text-neutral-700 tabular-money">{dreamProgress.progressPercent.toFixed(0)}%</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-0.5">Remaining</span>
              <span className="text-sm font-medium text-neutral-700 tabular-money">{formatCurrency(dreamProgress.remaining)}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-0.5">Target date</span>
              <span className="text-sm font-medium text-neutral-700">{formatDateLong(dreamGoal.target_date)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <TrendingDown size={14} className="text-neutral-400" />
              <span className="text-xs text-neutral-400">Required monthly savings:</span>
              <span className="text-sm font-semibold text-neutral-900 tabular-money">~{formatCurrency(dreamProgress.requiredMonthly)}</span>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <EditGoalModal
          kind={editing}
          goal={editing === 'main' ? mainGoal! : dreamGoal!}
          onClose={() => setEditing(null)}
          onSave={async (updates) => {
            await updateGoal(editing, updates);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

interface EditGoalModalProps {
  kind: GoalKind;
  goal: Goal;
  onClose: () => void;
  onSave: (updates: Partial<Goal>) => Promise<void>;
}

function EditGoalModal({ goal, onClose, onSave }: EditGoalModalProps) {
  const [name, setName] = useState(goal.name);
  const [targetAmount, setTargetAmount] = useState(goal.target_amount);
  const [initialSaved, setInitialSaved] = useState(goal.initial_saved);
  const [startDate, setStartDate] = useState(goal.start_date);
  const [targetDate, setTargetDate] = useState(goal.target_date);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name,
        target_amount: targetAmount,
        initial_saved: initialSaved,
        start_date: startDate,
        target_date: targetDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit goal" maxWidthClass="max-w-lg">
      <div className="flex flex-col gap-5">
        <Field label="Goal name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Target amount">
            <NumberInput value={targetAmount || ''} onChange={setTargetAmount} />
          </Field>
          <Field label="Already saved">
            <NumberInput value={initialSaved || ''} onChange={setInitialSaved} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date">
            <DateInput value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="Target date">
            <DateInput value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </Field>
        </div>
        {error && (
          <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700">{error}</div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}
