import { Plus, Trash2, Landmark, CreditCard, PiggyBank, Wallet, MoreHorizontal } from 'lucide-react';
import { Field, TextInput, NumberInput, PrimaryButton } from '@/components/shared/FormControls';
import { AccountType } from '@/types';
import { formatCurrency } from '@/lib/format';

export interface AccountItem {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}

const accountTypeOptions: { value: AccountType; label: string; icon: typeof Landmark }[] = [
  { value: 'bank', label: 'Bank account', icon: Landmark },
  { value: 'debit_card', label: 'Debit card', icon: CreditCard },
  { value: 'savings', label: 'Savings account', icon: PiggyBank },
  { value: 'cash', label: 'Cash', icon: Wallet },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const typeLabel: Record<AccountType, string> = {
  bank: 'Bank account',
  debit_card: 'Debit card',
  savings: 'Savings account',
  cash: 'Cash',
  other: 'Other',
};

interface Props {
  accounts: AccountItem[];
  onChange: (accounts: AccountItem[]) => void;
}

export function AccountsStep({ accounts, onChange }: Props) {
  const addAccount = () => {
    onChange([
      ...accounts,
      { id: crypto.randomUUID(), name: '', type: 'bank', balance: 0 },
    ]);
  };

  const updateAccount = (id: string, updates: Partial<AccountItem>) => {
    onChange(accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const removeAccount = (id: string) => {
    onChange(accounts.filter((a) => a.id !== id));
  };

  const total = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Where's your money?</h2>
        <p className="text-neutral-500 text-sm mt-1">Add the accounts where you keep your money.</p>
      </div>

      {accounts.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
          <p className="text-neutral-400 text-sm">No accounts yet. Add one to get started.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-xl border border-neutral-200 p-4 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Account {accounts.indexOf(account) + 1}
              </span>
              <button
                onClick={() => removeAccount(account.id)}
                className="p-1 rounded-md text-neutral-400 hover:text-error-500 hover:bg-error-50 transition-colors"
                aria-label="Remove account"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5">
                <Field label="Account name">
                  <TextInput
                    value={account.name}
                    onChange={(e) => updateAccount(account.id, { name: e.target.value })}
                    placeholder="e.g. Main Bank Account"
                  />
                </Field>
              </div>
              <div className="col-span-4">
                <Field label="Type">
                  <select
                    value={account.type}
                    onChange={(e) => updateAccount(account.id, { type: e.target.value as AccountType })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow text-sm"
                  >
                    {accountTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="col-span-3">
                <Field label="Balance">
                  <NumberInput
                    value={account.balance || ''}
                    onChange={(value) => updateAccount(account.id, { balance: value })}
                    placeholder="0"
                  />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PrimaryButton onClick={addAccount} className="w-fit">
        <Plus size={18} />
        Add account
      </PrimaryButton>

      {accounts.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-neutral-900 px-5 py-4">
          <span className="text-sm font-medium text-neutral-300">Total</span>
          <span className="text-xl font-display font-semibold text-white tabular-money">
            {formatCurrency(total)}
          </span>
        </div>
      )}
    </div>
  );
}

export function isAccountsValid(accounts: AccountItem[]): boolean {
  return accounts.every((a) => a.name.trim().length > 0);
}
