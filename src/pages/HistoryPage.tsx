import { useState, useMemo } from 'react';
import { TrendingUp, PiggyBank, Receipt, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { formatCurrency, formatCurrencySigned, formatDayHeading, todayISO } from '@/lib/format';
import { ExpenseCategory } from '@/types';

type FilterType = 'all' | 'income' | 'savings' | 'expenses';

const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  food: 'Food',
  transportation: 'Transportation',
  housing: 'Housing',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  health: 'Health',
  education: 'Education',
  other: 'Other',
};

const categoryColors: Record<ExpenseCategory, string> = {
  food: 'bg-orange-100 text-orange-700',
  transportation: 'bg-blue-100 text-blue-700',
  housing: 'bg-purple-100 text-purple-700',
  shopping: 'bg-pink-100 text-pink-700',
  entertainment: 'bg-yellow-100 text-yellow-700',
  health: 'bg-red-100 text-red-700',
  education: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-700',
};

interface DayGroup {
  date: string;
  income: { id: string; amount: number; type: string; note: string }[];
  savings: { id: string; amount: number; note: string }[];
  expenses: { id: string; amount: number; category: ExpenseCategory; note: string }[];
}

export function HistoryPage() {
  const { incomeEntries, savingsEntries, expenses } = useData();
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date(todayISO());
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const filteredIncome = useMemo(() => {
    if (filter !== 'all' && filter !== 'income') return [];
    return incomeEntries;
  }, [incomeEntries, filter]);

  const filteredSavings = useMemo(() => {
    if (filter !== 'all' && filter !== 'savings') return [];
    return savingsEntries;
  }, [savingsEntries, filter]);

  const filteredExpenses = useMemo(() => {
    if (filter !== 'all' && filter !== 'expenses') return [];
    let result = expenses;
    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }
    return result;
  }, [expenses, filter, categoryFilter]);

  const dayGroups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();
    const ensure = (date: string): DayGroup => {
      if (!map.has(date)) {
        map.set(date, { date, income: [], savings: [], expenses: [] });
      }
      return map.get(date)!;
    };

    filteredIncome.forEach((e) => ensure(e.date).income.push({ id: e.id, amount: e.amount, type: e.type, note: e.note }));
    filteredSavings.forEach((e) => ensure(e.date).savings.push({ id: e.id, amount: e.amount, note: e.note }));
    filteredExpenses.forEach((e) => ensure(e.date).expenses.push({ id: e.id, amount: e.amount, category: e.category, note: e.note }));

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredIncome, filteredSavings, filteredExpenses]);

  const hasAnyActivity = incomeEntries.length > 0 || savingsEntries.length > 0 || expenses.length > 0;

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'savings', label: 'Savings' },
    { value: 'expenses', label: 'Expenses' },
  ];

  // Calendar data
  const calendarData = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells: { date: string | null; day: number; income: number; savings: number; expenses: number; net: number }[] = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ date: null, day: 0, income: 0, savings: 0, expenses: 0, net: 0 });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayIncome = incomeEntries.filter((e) => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
      const daySavings = savingsEntries.filter((e) => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
      const dayExpenses = expenses.filter((e) => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
      cells.push({
        date: dateStr,
        day: d,
        income: dayIncome,
        savings: daySavings,
        expenses: dayExpenses,
        net: dayIncome - dayExpenses,
      });
    }

    return cells;
  }, [calendarMonth, incomeEntries, savingsEntries, expenses]);

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(calendarMonth);
  const today = todayISO();

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-neutral-900">History</h2>
          <p className="text-sm text-neutral-500 mt-1">Every financial activity, chronologically.</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-lg border border-neutral-200 p-1">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === opt.value ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {filter === 'all' || filter === 'expenses' ? (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'all')}
            className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="all">All categories</option>
            {Object.entries(expenseCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        ) : null}
      </div>

      {/* Content */}
      {view === 'list' && (
        <>
          {!hasAnyActivity && (
            <div className="rounded-xl2 border-2 border-dashed border-neutral-200 p-12 text-center">
              <p className="text-neutral-400">No activity yet. Start tracking your money today.</p>
            </div>
          )}

          {hasAnyActivity && dayGroups.length === 0 && (
            <div className="rounded-xl2 border-2 border-dashed border-neutral-200 p-12 text-center">
              <p className="text-neutral-400">No activities match your filters.</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {dayGroups.map((group) => (
              <div key={group.date} className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-5">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4 pb-3 border-b border-neutral-100">
                  {formatDayHeading(group.date)}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {group.income.map((item) => (
                    <div key={`i-${item.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center shrink-0">
                        <TrendingUp size={15} className="text-success-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-neutral-700">Income</span>
                        {item.note && <span className="text-xs text-neutral-400 ml-2">— {item.note}</span>}
                      </div>
                      <span className="text-sm font-semibold text-success-600 tabular-money">{formatCurrencySigned(item.amount)}</span>
                    </div>
                  ))}
                  {group.savings.map((item) => (
                    <div key={`s-${item.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <PiggyBank size={15} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-neutral-700">Saved</span>
                        {item.note && <span className="text-xs text-neutral-400 ml-2">— {item.note}</span>}
                      </div>
                      <span className="text-sm font-semibold text-primary-600 tabular-money">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  {group.expenses.map((item) => (
                    <div key={`e-${item.id}`} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-error-50 flex items-center justify-center shrink-0">
                        <Receipt size={15} className="text-error-600" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-sm text-neutral-700">{expenseCategoryLabels[item.category]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
                          {expenseCategoryLabels[item.category]}
                        </span>
                        {item.note && <span className="text-xs text-neutral-400">— {item.note}</span>}
                      </div>
                      <span className="text-sm font-semibold text-error-600 tabular-money">-{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'calendar' && (
        <div className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-lg font-display font-semibold text-neutral-900">{monthLabel}</span>
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-neutral-400 py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarData.map((cell, idx) => {
              if (!cell.date) return <div key={`empty-${idx}`} className="aspect-square" />;
              const isToday = cell.date === today;
              const hasActivity = cell.income > 0 || cell.savings > 0 || cell.expenses > 0;
              return (
                <div
                  key={cell.date}
                  className={`aspect-square rounded-lg border p-1.5 flex flex-col items-center justify-center text-xs transition-all ${
                    isToday
                      ? 'border-primary-500 bg-primary-50'
                      : hasActivity
                      ? 'border-neutral-200 bg-neutral-50'
                      : 'border-neutral-100'
                  }`}
                >
                  <span className={`font-medium ${isToday ? 'text-primary-700' : 'text-neutral-500'}`}>{cell.day}</span>
                  {hasActivity && (
                    <div className="flex gap-0.5 mt-0.5">
                      {cell.income > 0 && <div className="w-1.5 h-1.5 rounded-full bg-success-500" />}
                      {cell.savings > 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                      {cell.expenses > 0 && <div className="w-1.5 h-1.5 rounded-full bg-error-500" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success-500" />
              <span className="text-xs text-neutral-400">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-xs text-neutral-400">Savings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-error-500" />
              <span className="text-xs text-neutral-400">Expenses</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
