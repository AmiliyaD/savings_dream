import { Briefcase, Clock, Laptop, Building2, CalendarClock, GraduationCap, MoreHorizontal } from 'lucide-react';
import { Field, TextInput, OptionGrid } from '@/components/shared/FormControls';

export interface AboutYouData {
  name: string;
  whatDoYouDo: string;
  occupation: string;
  employmentType: string;
}

const employmentOptions = [
  { value: 'full_time', label: 'Full-time job', icon: Briefcase },
  { value: 'part_time', label: 'Part-time job', icon: Clock },
  { value: 'freelance', label: 'Freelance', icon: Laptop },
  { value: 'self_employed', label: 'Self-employed', icon: Building2 },
  { value: 'shift_work', label: 'Shift work', icon: CalendarClock },
  { value: 'student_and_work', label: 'Student + work', icon: GraduationCap },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

interface Props {
  data: AboutYouData;
  onChange: (data: AboutYouData) => void;
}

export function AboutYouStep({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-display font-semibold text-neutral-900">About you</h2>
        <p className="text-neutral-500 text-sm mt-1">Let's start with the basics.</p>
      </div>

      <Field label="Name">
        <TextInput
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g. Alex"
          autoFocus
        />
      </Field>

      <Field label="What do you do?">
        <TextInput
          value={data.whatDoYouDo}
          onChange={(e) => onChange({ ...data, whatDoYouDo: e.target.value })}
          placeholder="e.g. I design mobile apps"
        />
      </Field>

      <Field label="Occupation">
        <TextInput
          value={data.occupation}
          onChange={(e) => onChange({ ...data, occupation: e.target.value })}
          placeholder="e.g. Product Designer"
        />
      </Field>

      <Field label="Employment type">
        <OptionGrid
          options={employmentOptions}
          value={data.employmentType}
          onChange={(value) => onChange({ ...data, employmentType: value })}
          columns={2}
        />
      </Field>
    </div>
  );
}

export function isAboutYouValid(data: AboutYouData): boolean {
  return data.name.trim().length > 0 && data.employmentType.length > 0;
}
