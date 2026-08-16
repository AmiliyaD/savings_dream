import { useState, useMemo } from 'react';
import { TrendingUp, PiggyBank, Receipt, Plus, ArrowRight, Sparkles, Rocket, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { AddActivityModal } from '@/components/dashboard/AddActivityModal';
import { getGoalProgress, statusMessage, GoalStatus } from '@/lib/calculations';
import { formatCurrency, formatCurrencySigned, formatDateLong, todayISO } from '@/lib/format';
import { Page } from '@/types';

interface Props {
  onNavigate: (page: Page) => void;
}

export function DashboardPage({ onNavigate }: Props) {
  const { profile, mainGoal, dreamGoal, accounts, incomeEntries, savingsEntries, expenses } = useData();
  const [activityOpen, setActivityOpen] = useState(false);

  const today = todayISO();

  const mainGoalSavings = useMemo(
    () => savingsEntries.filter((s) => s.goal_id === mainGoal?.id).reduce((sum, s) => sum + s.amount, 0)
      + accounts.filter((a) => a.goal_id === mainGoal?.id).reduce((sum, a) => sum + a.balance, 0),
    [savingsEntries, accounts, mainGoal],
  );

  const mainProgress = mainGoal ? getGoalProgress(mainGoal, mainGoalSavings) : null;
  const dreamSavings = useMemo(
    () => savingsEntries.filter((s) => s.goal_id === dreamGoal?.id).reduce((sum, s) => sum + s.amount, 0)
      + accounts.filter((a) => a.goal_id === dreamGoal?.id).reduce((sum, a) => sum + a.balance, 0),
    [savingsEntries, accounts, dreamGoal],
  );
  const dreamProgress = dreamGoal ? getGoalProgress(dreamGoal, dreamSavings) : null;

  const todayIncome = incomeEntries.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);
  const todaySavings = savingsEntries.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);
  const todayExpenses = expenses.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);
  const todayNet = todayIncome - todayExpenses;

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const monthPrefix = today.slice(0, 7);
  const monthSavings = savingsEntries.filter((e) => e.date.startsWith(monthPrefix)).reduce((s, e) => s + e.amount, 0);
  const monthTarget = mainProgress?.requiredMonthly ?? 0;
  const monthProgressPercent = monthTarget > 0 ? Math.min(100, (monthSavings / monthTarget) * 100) : 0;

  const daysInMonth = new Date(new Date(today).getFullYear(), new Date(today).getMonth() + 1, 0).getDate();
  const dayOfMonth = new Date(today).getDate();
  const avgPerDay = dayOfMonth > 0 ? monthSavings / dayOfMonth : 0;
  const avgPerWeek = avgPerDay * 7;
  const avgPerMonth = avgPerDay * daysInMonth;

  const status = mainProgress?.status ?? 'on_track';

  const statusConfig: Record<GoalStatus, { icon: typeof Rocket; bg: string; text: string; iconColor: string }> = {
    completed: { icon: CheckCircle2, bg: 'bg-success-50 border-success-200', text: 'text-success-700', iconColor: 'text-success-600' },
    ahead: { icon: Sparkles, bg: 'bg-secondary-50 border-secondary-200', text: 'text-secondary-700', iconColor: 'text-secondary-600' },
    on_track: { icon: Rocket, bg: 'bg-primary-50 border-primary-200', text: 'text-primary-700', iconColor: 'text-primary-600' },
    behind: { icon: AlertTriangle, bg: 'bg-warning-50 border-warning-200', text: 'text-warning-700', iconColor: 'text-warning-600' },
  };
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Goal Card - largest */}
        {mainGoal && mainProgress && (
          <div className="col-span-8 bg-white rounded-xl2 shadow-card border border-neutral-100 p-7">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">Current Goal</span>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1"
              >
                View goals <ArrowRight size={12} />
              </button>
            </div>
            <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-5">{mainGoal.name}</h2>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-3xl font-display font-bold text-neutral-900 tabular-money">
                {formatCurrency(mainProgress.currentSaved)}
              </span>
              <span className="text-lg text-neutral-400 tabular-money">/ {formatCurrency(mainGoal.target_amount)}</span>
            </div>

            <ProgressBar percent={mainProgress.progressPercent} heightClass="h-4" />

            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-semibold text-primary-600 tabular-money">
                {mainProgress.progressPercent.toFixed(1)}% complete
              </span>
              <span className="text-sm text-neutral-500 tabular-money">
                {formatCurrency(mainProgress.remaining)} remaining
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-neutral-100">
              <div>
                <span className="block text-xs text-neutral-400 mb-1">Target date</span>
                <span className="text-sm font-medium text-neutral-700">{formatDateLong(mainGoal.target_date)}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-400 mb-1">Required / month</span>
                <span className="text-sm font-semibold text-neutral-900 tabular-money">
                  ~{formatCurrency(mainProgress.requiredMonthly)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-neutral-400 mb-1">Required / day</span>
                <span className="text-sm font-semibold text-neutral-900 tabular-money">
                  ~{formatCurrency(mainProgress.requiredDaily)}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-2.5 mt-5 px-4 py-3 rounded-lg border ${statusInfo.bg}`}>
              <StatusIcon size={18} className={statusInfo.iconColor} />
              <span className={`text-sm font-medium ${statusInfo.text}`}>{statusMessage(status)}</span>
            </div>
          </div>
        )}

        {/* Today's Finances */}
        <div className="col-span-4 bg-white rounded-xl2 shadow-card border border-neutral-100 p-7 flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">Today</span>

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center">
                  <TrendingUp size={17} className="text-success-600" />
                </div>
                <span className="text-sm text-neutral-500">Earned</span>
              </div>
              <span className="text-lg font-display font-semibold text-neutral-900 tabular-money">
                {formatCurrency(todayIncome)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                  <PiggyBank size={17} className="text-primary-600" />
                </div>
                <span className="text-sm text-neutral-500">Saved</span>
              </div>
              <span className="text-lg font-display font-semibold text-neutral-900 tabular-money">
                {formatCurrency(todaySavings)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-error-50 flex items-center justify-center">
                  <Receipt size={17} className="text-error-600" />
                </div>
                <span className="text-sm text-neutral-500">Spent</span>
              </div>
              <span className="text-lg font-display font-semibold text-neutral-900 tabular-money">
                {formatCurrency(todayExpenses)}
              </span>
            </div>

            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-500">Net</span>
                <span className={`text-xl font-display font-bold tabular-money ${todayNet >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                  {formatCurrencySigned(todayNet)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivityOpen(true)}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            Add activity
          </button>
        </div>

        {/* Total Money */}
        <div
          className="col-span-4 bg-white rounded-xl2 shadow-card border border-neutral-100 p-7 cursor-pointer hover:shadow-card-hover transition-shadow"
          onClick={() => onNavigate('money')}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Money</span>
            <ArrowRight size={14} className="text-neutral-300" />
          </div>
          <span className="text-3xl font-display font-bold text-neutral-900 tabular-money block mb-5">
            {formatCurrency(totalBalance)}
          </span>
          <div className="flex flex-col gap-2.5">
            {accounts.slice(0, 4).map((account) => (
              <div key={account.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-500 truncate pr-2">{account.name}</span>
                <span className="text-neutral-700 font-medium tabular-money shrink-0">{formatCurrency(account.balance)}</span>
              </div>
            ))}
            {accounts.length === 0 && (
              <p className="text-sm text-neutral-400">No accounts yet.</p>
            )}
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="col-span-4 bg-white rounded-xl2 shadow-card border border-neutral-100 p-7">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-4">This Month</span>

          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-2xl font-display font-bold text-neutral-900 tabular-money">{formatCurrency(monthSavings)}</span>
            <span className="text-sm text-neutral-400 tabular-money">/ {formatCurrency(monthTarget)}</span>
          </div>

          <ProgressBar percent={monthProgressPercent} colorClass="bg-secondary-500" heightClass="h-3" />

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold text-secondary-600 tabular-money">{monthProgressPercent.toFixed(0)}% of target</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-neutral-100">
            <div>
              <span className="block text-xs text-neutral-400 mb-0.5">Avg / day</span>
              <span className="text-sm font-medium text-neutral-700 tabular-money">{formatCurrency(avgPerDay)}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-0.5">Avg / week</span>
              <span className="text-sm font-medium text-neutral-700 tabular-money">{formatCurrency(avgPerWeek)}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-0.5">Avg / month</span>
              <span className="text-sm font-medium text-neutral-700 tabular-money">{formatCurrency(avgPerMonth)}</span>
            </div>
          </div>
        </div>

        {/* Long-term Dream - smaller */}
        {dreamGoal && dreamProgress && (
          <div className="col-span-4 bg-white rounded-xl2 shadow-card border border-neutral-100 p-7">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary-500">Long-Term Dream</span>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1"
              >
                Edit <ArrowRight size={12} />
              </button>
            </div>
            <h3 className="text-lg font-display font-semibold text-neutral-900 mb-4">{dreamGoal.name}</h3>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl font-display font-bold text-neutral-900 tabular-money">
                {formatCurrency(dreamProgress.currentSaved)}
              </span>
              <span className="text-sm text-neutral-400 tabular-money">/ {formatCurrency(dreamGoal.target_amount)}</span>
            </div>

            <ProgressBar percent={dreamProgress.progressPercent} colorClass="bg-secondary-400" heightClass="h-2.5" />

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium text-secondary-600 tabular-money">
                {dreamProgress.progressPercent.toFixed(0)}% complete
              </span>
              <span className="text-xs text-neutral-400 tabular-money">
                {formatCurrency(dreamProgress.remaining)} left
              </span>
            </div>
          </div>
        )}
      </div>

      <AddActivityModal isOpen={activityOpen} onClose={() => setActivityOpen(false)} defaultGoalId={mainGoal?.id ?? null} />
    </div>
  );
}
