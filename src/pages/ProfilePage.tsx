import { useState } from 'react';
import { User, Briefcase, Clock, Laptop, Building2, CalendarClock, GraduationCap, MoreHorizontal, Check } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Field, TextInput, NumberInput, OptionGrid, PrimaryButton } from '@/components/shared/FormControls';
import { formatCurrency } from '@/lib/format';
import { EmploymentType, IncomeType } from '@/types';

const employmentOptions = [
  { value: 'full_time', label: 'Full-time job', icon: Briefcase },
  { value: 'part_time', label: 'Part-time job', icon: Clock },
  { value: 'freelance', label: 'Freelance', icon: Laptop },
  { value: 'self_employed', label: 'Self-employed', icon: Building2 },
  { value: 'shift_work', label: 'Shift work', icon: CalendarClock },
  { value: 'student_and_work', label: 'Student + work', icon: GraduationCap },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const employmentLabels: Record<string, string> = {
  full_time: 'Full-time job',
  part_time: 'Part-time job',
  freelance: 'Freelance',
  self_employed: 'Self-employed',
  shift_work: 'Shift work',
  student_and_work: 'Student + work',
  other: 'Other',
};

const incomeTypeLabels: Record<string, string> = {
  monthly_salary: 'Monthly salary',
  per_shift: 'Per-shift income',
  irregular: 'Freelance / irregular income',
  mixed: 'Mixed income',
};

export function ProfilePage() {
  const { profile, updateProfile } = useData();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(profile?.name ?? '');
  const [whatDoYouDo, setWhatDoYouDo] = useState(profile?.what_do_you_do ?? '');
  const [occupation, setOccupation] = useState(profile?.occupation ?? '');
  const [employmentType, setEmploymentType] = useState<string>(profile?.employment_type ?? '');
  const [incomeType, setIncomeType] = useState<string>(profile?.income_type ?? '');
  const [incomeAmount, setIncomeAmount] = useState(profile?.income_amount ?? 0);

  if (!profile) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        name,
        what_do_you_do: whatDoYouDo,
        occupation,
        employment_type: employmentType as EmploymentType,
        income_type: incomeType as IncomeType,
        income_amount: incomeAmount,
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-semibold text-neutral-900">Profile</h2>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Edit profile
          </button>
        </div>

        <div className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-7">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-100">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
              <User size={28} />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold text-neutral-900">{profile.name}</h3>
              <p className="text-sm text-neutral-500">{profile.occupation || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <span className="block text-xs text-neutral-400 mb-1">Name</span>
              <span className="text-sm font-medium text-neutral-700">{profile.name}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-1">What you do</span>
              <span className="text-sm font-medium text-neutral-700">{profile.what_do_you_do || '—'}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-1">Occupation</span>
              <span className="text-sm font-medium text-neutral-700">{profile.occupation || '—'}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-1">Employment type</span>
              <span className="text-sm font-medium text-neutral-700">{employmentLabels[profile.employment_type] || '—'}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-1">Income type</span>
              <span className="text-sm font-medium text-neutral-700">{incomeTypeLabels[profile.income_type] || '—'}</span>
            </div>
            <div>
              <span className="block text-xs text-neutral-400 mb-1">Typical income</span>
              <span className="text-sm font-medium text-neutral-700 tabular-money">{formatCurrency(profile.income_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold text-neutral-900">Edit profile</h2>
      </div>

      <div className="bg-white rounded-xl2 shadow-card border border-neutral-100 p-7">
        <div className="flex flex-col gap-5">
          <Field label="Name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="What do you do?">
            <TextInput value={whatDoYouDo} onChange={(e) => setWhatDoYouDo(e.target.value)} />
          </Field>
          <Field label="Occupation">
            <TextInput value={occupation} onChange={(e) => setOccupation(e.target.value)} />
          </Field>
          <Field label="Employment type">
            <OptionGrid
              options={employmentOptions}
              value={employmentType}
              onChange={setEmploymentType}
              columns={2}
            />
          </Field>
          <Field label="Income type">
            <select
              value={incomeType}
              onChange={(e) => setIncomeType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow text-sm"
            >
              <option value="">Select...</option>
              {Object.entries(incomeTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Typical income">
            <NumberInput value={incomeAmount || ''} onChange={setIncomeAmount} />
          </Field>

          {error && (
            <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 font-medium text-sm hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
              {!saving && <Check size={16} />}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
