import { Info, PiggyBank } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Settings</h2>
        <p className="text-sm text-neutral-500 mt-1">App preferences and information.</p>
      </div>

      <div className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <PiggyBank size={20} className="text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-neutral-900">About Dream Savings</h3>
            <p className="text-xs text-neutral-400">Version 1.0</p>
          </div>
        </div>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Dream Savings helps you turn a financial dream into a concrete plan and track your progress
          every day. All your data is stored locally and privately on this device's database.
        </p>
      </div>

      <div className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center">
            <Info size={20} className="text-secondary-600" />
          </div>
          <h3 className="font-medium text-neutral-900">Your data</h3>
        </div>
        <p className="text-sm text-neutral-500 leading-relaxed">
          Your financial information — profile, goals, accounts, and daily activity — is stored in a
          private database. No data is shared with third parties or sent to external services.
        </p>
      </div>
    </div>
  );
}
