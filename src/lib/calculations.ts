import { Goal } from '@/types';

const MS_PER_DAY = 86400000;
const DAYS_PER_MONTH = 30.4368;

export type GoalStatus = 'completed' | 'ahead' | 'on_track' | 'behind';

export interface GoalProgress {
  currentSaved: number;
  progressPercent: number;
  remaining: number;
  daysRemaining: number;
  weeksRemaining: number;
  monthsRemaining: number;
  requiredDaily: number;
  requiredWeekly: number;
  requiredMonthly: number;
  isCompleted: boolean;
  isOverdue: boolean;
  status: GoalStatus;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type GoalMathInput = Pick<Goal, 'target_amount' | 'initial_saved' | 'start_date' | 'target_date'>;

export function getGoalProgress(goal: GoalMathInput, savingsSum: number): GoalProgress {
  const currentSaved = goal.initial_saved + savingsSum;
  const target = goal.target_amount;
  const rawProgress = target > 0 ? (currentSaved / target) * 100 : 0;
  const progressPercent = Math.min(100, Math.max(0, rawProgress));
  const isCompleted = target > 0 && currentSaved >= target;
  const remaining = Math.max(0, target - currentSaved);

  const today = startOfDay(new Date());
  const targetDate = startOfDay(new Date(`${goal.target_date}T00:00:00`));
  const startDate = startOfDay(new Date(`${goal.start_date}T00:00:00`));

  const rawDaysRemaining = Math.round((targetDate.getTime() - today.getTime()) / MS_PER_DAY);
  const daysRemaining = Math.max(0, rawDaysRemaining);
  const isOverdue = rawDaysRemaining < 0 && !isCompleted;

  const safeDays = Math.max(1, rawDaysRemaining);
  const weeksRemaining = safeDays / 7;
  const monthsRemaining = safeDays / DAYS_PER_MONTH;

  const requiredDaily = isCompleted ? 0 : remaining / safeDays;
  const requiredWeekly = isCompleted ? 0 : remaining / weeksRemaining;
  const requiredMonthly = isCompleted ? 0 : remaining / monthsRemaining;

  let status: GoalStatus;
  if (isCompleted) {
    status = 'completed';
  } else {
    const totalSpan = targetDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    const expectedProgress =
      totalSpan > 0 ? Math.min(100, Math.max(0, (elapsed / totalSpan) * 100)) : 100;
    const diff = progressPercent - expectedProgress;
    if (diff >= 5) status = 'ahead';
    else if (diff <= -5) status = 'behind';
    else status = 'on_track';
  }

  return {
    currentSaved,
    progressPercent,
    remaining,
    daysRemaining,
    weeksRemaining,
    monthsRemaining,
    requiredDaily,
    requiredWeekly,
    requiredMonthly,
    isCompleted,
    isOverdue,
    status,
  };
}

export function statusMessage(status: GoalStatus): string {
  switch (status) {
    case 'completed':
      return 'Goal achieved!';
    case 'ahead':
      return "You're ahead of schedule!";
    case 'behind':
      return "You're a little behind schedule.";
    case 'on_track':
    default:
      return "You're on track";
  }
}

export function isSameDate(dateStr: string, isoDate: string): boolean {
  return dateStr === isoDate;
}

export function isSameMonth(dateStr: string, referenceIso: string): boolean {
  return dateStr.slice(0, 7) === referenceIso.slice(0, 7);
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
