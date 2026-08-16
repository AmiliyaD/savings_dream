import { Field, TextInput, NumberInput, DateInput } from '@/components/shared/FormControls';
import { getGoalProgress } from '@/lib/calculations';
import { formatCurrency, todayISO } from '@/lib/format';

export interface GoalStepData {
  name: string;
  target_amount: number;
  initial_saved: number;
  start_date: string;
  target_date: string;
}

interface Props {
  data: GoalStepData;
  onChange: (data: GoalStepData) => void;
  title: string;
  subtitle: string;
  namePlaceholder: string;
  accentClass: string;
}

export function GoalStep({ data, onChange, title, subtitle, namePlaceholder, accentClass }: Props) {
  const canPreview = data.target_amount > 0 && data.start_date && data.target_date;
  const progress = canPreview ? getGoalProgress(data, 0) : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">{title}</h2>
        <p className="text-neutral-500 text-sm mt-1">{subtitle}</p>
      </div>

      <Field label="Goal name">
        <TextInput
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder={namePlaceholder}
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Target amount">
          <NumberInput
            value={data.target_amount || ''}
            onChange={(value) => onChange({ ...data, target_amount: value })}
            placeholder="200000"
          />
        </Field>
        <Field label="Already saved">
          <NumberInput
            value={data.initial_saved || ''}
            onChange={(value) => onChange({ ...data, initial_saved: value })}
            placeholder="0"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Start date">
          <DateInput
            value={data.start_date || todayISO()}
            onChange={(e) => onChange({ ...data, start_date: e.target.value })}
          />
        </Field>
        <Field label="Target date">
          <DateInput
            value={data.target_date}
            onChange={(e) => onChange({ ...data, target_date: e.target.value })}
          />
        </Field>
      </div>

      {progress && (
        <div className={`rounded-xl border p-4 ${accentClass}`}>
          <p className="text-sm leading-relaxed">
            You need to save about{' '}
            <span className="font-semibold tabular-money">{formatCurrency(progress.requiredMonthly)}</span> per
            month to reach this goal on time.
          </p>
          <div className="flex gap-6 mt-3 text-xs">
            <div>
              <span className="block opacity-70">Remaining</span>
              <span className="font-semibold tabular-money">{formatCurrency(progress.remaining)}</span>
            </div>
            <div>
              <span className="block opacity-70">Time remaining</span>
              <span className="font-semibold">{Math.round(progress.monthsRemaining)} months</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function isGoalStepValid(data: GoalStepData): boolean {
  return (
    data.name.trim().length > 0 &&
    data.target_amount > 0 &&
    data.start_date.length > 0 &&
    data.target_date.length > 0 &&
    new Date(data.target_date) > new Date(data.start_date)
  );
}
