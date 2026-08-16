import { CalendarDays, Clock3, Shuffle, Layers } from 'lucide-react';
import { Field, NumberInput, OptionGrid } from '@/components/shared/FormControls';

export interface IncomeData {
  incomeType: string;
  incomeAmount: number;
}

const incomeOptions = [
  { value: 'monthly_salary', label: 'Monthly salary', icon: CalendarDays },
  { value: 'per_shift', label: 'Per-shift income', icon: Clock3 },
  { value: 'irregular', label: 'Freelance / irregular income', icon: Shuffle },
  { value: 'mixed', label: 'Mixed income', icon: Layers },
];

const amountLabel: Record<string, string> = {
  monthly_salary: 'Typical income per month',
  per_shift: 'Typical income per shift',
  irregular: 'Approximate income per month',
  mixed: 'Approximate total income per month',
};

interface Props {
  data: IncomeData;
  onChange: (data: IncomeData) => void;
}

export function IncomeStep({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">How do you usually earn money?</h2>
        <p className="text-neutral-500 text-sm mt-1">This helps us understand your financial rhythm.</p>
      </div>

      <Field label="Income type">
        <OptionGrid
          options={incomeOptions}
          value={data.incomeType}
          onChange={(value) => onChange({ ...data, incomeType: value })}
          columns={2}
        />
      </Field>

      {data.incomeType && (
        <Field label={amountLabel[data.incomeType]} hint="You can update this later in Settings.">
          <NumberInput
            value={data.incomeAmount || ''}
            onChange={(value) => onChange({ ...data, incomeAmount: value })}
            placeholder="e.g. 150000"
          />
        </Field>
      )}
    </div>
  );
}

export function isIncomeValid(data: IncomeData): boolean {
  return data.incomeType.length > 0;
}
