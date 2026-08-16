import { useState } from 'react';
import { Plus, Edit2, Trash2, Landmark, CreditCard, PiggyBank, Wallet, MoreHorizontal, Check, Target, Link2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Modal } from '@/components/shared/Modal';
import { Field, TextInput, NumberInput, PrimaryButton, SecondaryButton } from '@/components/shared/FormControls';
import { formatCurrency } from '@/lib/format';
import { Account, AccountType, Goal } from '@/types';

const accountTypeOptions: { value: AccountType; label: string; icon: typeof Landmark }[] = [
  { value: 'bank', label: 'Bank account', icon: Landmark },
  { value: 'debit_card', label: 'Debit card', icon: CreditCard },
  { value: 'savings', label: 'Savings account', icon: PiggyBank },
  { value: 'cash', label: 'Cash', icon: Wallet },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const typeIcon: Record<AccountType, typeof Landmark> = {
  bank: Landmark,
  debit_card: CreditCard,
  savings: PiggyBank,
  cash: Wallet,
  other: MoreHorizontal,
};

const typeLabel: Record<AccountType, string> = {
  bank: 'Bank account',
  debit_card: 'Debit card',
  savings: 'Savings account',
  cash: 'Cash',
  other: 'Other',
};

export function MoneyPage() {
  const { accounts, goals, addAccount, updateAccount, deleteAccount } = useData();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const editingAccount = accounts.find((a) => a.id === editingId) ?? null;
  const deletingAccount = accounts.find((a) => a.id === confirmDeleteId) ?? null;

  const goalName = (goalId: string | null) => {
    if (!goalId) return null;
    const goal = goals.find((g) => g.id === goalId);
    return goal ? goal.name : null;
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-neutral-900">Accounts</h2>
          <p className="text-sm text-neutral-500 mt-1">Manage where your money lives.</p>
        </div>
        <PrimaryButton onClick={() => setAdding(true)}>
          <Plus size={18} />
          Add account
        </PrimaryButton>
      </div>

      <div className="rounded-xl2 bg-neutral-900 px-7 py-6 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-300">Total balance</span>
        <span className="text-3xl font-display font-bold text-white tabular-money">{formatCurrency(totalBalance)}</span>
      </div>

      {accounts.length === 0 && (
        <div className="rounded-xl2 border-2 border-dashed border-neutral-200 p-12 text-center">
          <p className="text-neutral-400">No accounts yet. Add one to start tracking your money.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {accounts.map((account) => {
          const Icon = typeIcon[account.type];
          const linkedGoalName = goalName(account.goal_id);
          return (
            <div key={account.id} className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-neutral-900 truncate">{account.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-neutral-400">{typeLabel[account.type]}</p>
                  {linkedGoalName && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      <Link2 size={10} />
                      {linkedGoalName}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-lg font-display font-semibold text-neutral-900 tabular-money">{formatCurrency(account.balance)}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingId(account.id)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
                  aria-label="Edit account"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(account.id)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-error-500 hover:bg-error-50 transition-colors"
                  aria-label="Delete account"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {(adding || editingAccount) && (
        <AccountModal
          account={editingAccount}
          goals={goals}
          onClose={() => {
            setAdding(false);
            setEditingId(null);
          }}
          onSave={async (data) => {
            if (editingAccount) {
              await updateAccount(editingAccount.id, data);
            } else {
              await addAccount(data);
            }
            setAdding(false);
            setEditingId(null);
          }}
        />
      )}

      {deletingAccount && (
        <Modal isOpen onClose={() => setConfirmDeleteId(null)} title="Delete account" maxWidthClass="max-w-md">
          <p className="text-sm text-neutral-600 mb-6">
            Are you sure you want to delete <span className="font-medium text-neutral-900">{deletingAccount.name}</span>? This action can't be undone.
          </p>
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => setConfirmDeleteId(null)}>Cancel</SecondaryButton>
            <button
              onClick={async () => {
                await deleteAccount(deletingAccount.id);
                setConfirmDeleteId(null);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-error-600 text-white font-medium text-sm hover:bg-error-700 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface AccountModalProps {
  account: Account | null;
  goals: Goal[];
  onClose: () => void;
  onSave: (data: { name: string; type: AccountType; balance: number; goal_id: string | null }) => Promise<void>;
}

function AccountModal({ account, goals, onClose, onSave }: AccountModalProps) {
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<AccountType>(account?.type ?? 'bank');
  const [balance, setBalance] = useState(account?.balance ?? 0);
  const [linkToGoal, setLinkToGoal] = useState<boolean>(account?.goal_id != null);
  const [goalId, setGoalId] = useState<string>(account?.goal_id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name,
        type,
        balance,
        goal_id: linkToGoal && goalId ? goalId : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={account ? 'Edit account' : 'Add account'} maxWidthClass="max-w-md">
      <div className="flex flex-col gap-5">
        <Field label="Account name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Bank Account" autoFocus />
        </Field>
        <Field label="Account type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow text-sm"
          >
            {accountTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Current balance">
          <NumberInput value={balance || ''} onChange={setBalance} placeholder="0" />
        </Field>

        <div className="border-t border-neutral-100 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Target size={16} className="text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700">Add to an existing goal?</span>
            </div>
            <button
              type="button"
              onClick={() => setLinkToGoal(!linkToGoal)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                linkToGoal ? 'bg-primary-600' : 'bg-neutral-200'
              }`}
              aria-label="Toggle goal link"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  linkToGoal ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {linkToGoal && (
            <div className="mt-4 animate-fade-in">
              {goals.length === 0 ? (
                <p className="text-sm text-neutral-400">No goals yet. Create a goal first to link this account.</p>
              ) : (
                <>
                  <Field label="Goal">
                    <select
                      value={goalId}
                      onChange={(e) => setGoalId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow text-sm"
                    >
                      <option value="">Select goal...</option>
                      {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.kind === 'main' ? 'Current Goal' : 'Long-term Dream'} — {goal.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {goalId && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary-50 border border-primary-100 px-3.5 py-2.5 animate-fade-in">
                      <Check size={14} className="text-primary-600 shrink-0" />
                      <span className="text-xs text-primary-700">
                        {formatCurrency(balance || 0)} will count toward this goal
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mt-2">
                    Money in this account will be counted toward the selected goal.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700">{error}</div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSave} disabled={saving || !name.trim() || (linkToGoal && !goalId)}>
            {saving ? 'Saving...' : 'Save'}
            {!saving && <Check size={16} />}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}
