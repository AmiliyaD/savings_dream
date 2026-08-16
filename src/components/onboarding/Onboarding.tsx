import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, PiggyBank } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { AboutYouStep, AboutYouData, isAboutYouValid } from './steps/AboutYouStep';
import { IncomeStep, IncomeData, isIncomeValid } from './steps/IncomeStep';
import { GoalStep, GoalStepData, isGoalStepValid } from './steps/GoalStep';
import { AccountsStep, AccountItem, isAccountsValid } from './steps/AccountsStep';
import { PrimaryButton, SecondaryButton } from '@/components/shared/FormControls';
import { todayISO } from '@/lib/format';

const TOTAL_STEPS = 5;

const defaultMainGoal: GoalStepData = {
  name: '',
  target_amount: 0,
  initial_saved: 0,
  start_date: todayISO(),
  target_date: '',
};

const defaultDreamGoal: GoalStepData = {
  name: '',
  target_amount: 0,
  initial_saved: 0,
  start_date: todayISO(),
  target_date: '',
};

export function Onboarding() {
  const { completeOnboarding } = useData();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aboutYou, setAboutYou] = useState<AboutYouData>({
    name: '',
    whatDoYouDo: '',
    occupation: '',
    employmentType: '',
  });
  const [income, setIncome] = useState<IncomeData>({
    incomeType: '',
    incomeAmount: 0,
  });
  const [mainGoal, setMainGoal] = useState<GoalStepData>(defaultMainGoal);
  const [dreamGoal, setDreamGoal] = useState<GoalStepData>(defaultDreamGoal);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);

  const stepValid = [
    isAboutYouValid(aboutYou),
    isIncomeValid(income),
    isGoalStepValid(mainGoal),
    isGoalStepValid(dreamGoal),
    isAccountsValid(accounts),
  ];

  const canProceed = stepValid[step];
  const isLastStep = step === TOTAL_STEPS - 1;

  const handleNext = async () => {
    if (!canProceed) return;
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await completeOnboarding(
        {
          name: aboutYou.name,
          what_do_you_do: aboutYou.whatDoYouDo,
          occupation: aboutYou.occupation,
          employment_type: aboutYou.employmentType,
          income_type: income.incomeType,
          income_amount: income.incomeAmount,
        },
        mainGoal,
        dreamGoal,
        accounts.map((a) => ({ name: a.name, type: a.type, balance: a.balance })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
            <PiggyBank size={22} className="text-white" strokeWidth={2} />
          </div>
          <span className="font-display font-semibold text-neutral-900 text-lg tracking-tight">
            Dream Savings
          </span>
        </div>

        <div className="bg-white rounded-xl2 shadow-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-neutral-400 tabular-money">
              {step + 1}/{TOTAL_STEPS}
            </span>
          </div>

          <div key={step} className="animate-fade-in">
            {step === 0 && <AboutYouStep data={aboutYou} onChange={setAboutYou} />}
            {step === 1 && <IncomeStep data={income} onChange={setIncome} />}
            {step === 2 && (
              <GoalStep
                data={mainGoal}
                onChange={setMainGoal}
                title="Your current goal"
                subtitle="What are you actively saving for right now?"
                namePlaceholder="e.g. Save 200,000 ₽"
                accentClass="bg-primary-50 border-primary-200 text-primary-900"
              />
            )}
            {step === 3 && (
              <GoalStep
                data={dreamGoal}
                onChange={setDreamGoal}
                title="Your long-term dream"
                subtitle="What's the big dream you're building toward?"
                namePlaceholder="e.g. Buy an apartment"
                accentClass="bg-secondary-50 border-secondary-200 text-secondary-900"
              />
            )}
            {step === 4 && <AccountsStep accounts={accounts} onChange={setAccounts} />}
          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-100">
            {step > 0 ? (
              <SecondaryButton onClick={handleBack} disabled={submitting}>
                <ArrowLeft size={16} />
                Back
              </SecondaryButton>
            ) : (
              <span />
            )}
            <PrimaryButton onClick={handleNext} disabled={!canProceed || submitting}>
              {isLastStep ? (
                <>
                  {submitting ? 'Saving...' : 'Finish setup'}
                  <Check size={16} />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </PrimaryButton>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          You can change everything later in Settings.
        </p>
      </div>
    </div>
  );
}
