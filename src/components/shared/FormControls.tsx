import { ReactNode, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-neutral-400 mt-1.5">{hint}</span>}
    </label>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: TextInputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow ${props.className ?? ''}`}
    />
  );
}

interface NumberInputProps {
  value: number | '';
  onChange: (value: number) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
}

export function NumberInput({ value, onChange, placeholder, suffix = '₽', min = 0 }: NumberInputProps) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        className="w-full px-3.5 py-2.5 pr-12 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 tabular-money transition-shadow"
      />
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
        {suffix}
      </span>
    </div>
  );
}

export function DateInput(props: TextInputProps) {
  return <input type="date" {...props} className={`w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-shadow ${props.className ?? ''}`} />;
}

export interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

interface OptionGridProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3;
}

export function OptionGrid({ options, value, onChange, columns = 2 }: OptionGridProps) {
  return (
    <div className={`grid ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
      {options.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
              selected
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {Icon && (
                <Icon
                  size={18}
                  className={selected ? 'text-primary-600' : 'text-neutral-400'}
                  strokeWidth={2}
                />
              )}
              <span className={`font-medium text-sm ${selected ? 'text-primary-900' : 'text-neutral-700'}`}>
                {option.label}
              </span>
            </div>
            {option.description && (
              <p className="text-xs text-neutral-400 mt-1 ml-[26px]">{option.description}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}

export function PrimaryButton({ children, onClick, type = 'button', disabled, className = '' }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, type = 'button', disabled, className = '' }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-neutral-200 text-neutral-700 font-medium text-sm hover:bg-neutral-50 hover:border-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
