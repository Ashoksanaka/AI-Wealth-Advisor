"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { saveRiskProfile } from "@/actions/risk-profile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/lib/format-currency";
import { Shield, TrendingUp, Target, PiggyBank } from "lucide-react";

const STEPS = [
  { id: 1, title: "Risk Tolerance", icon: Shield },
  { id: 2, title: "Investment Horizon", icon: TrendingUp },
  { id: 3, title: "Savings Capacity", icon: PiggyBank },
  { id: 4, title: "Goals Intent", icon: Target },
  { id: 5, title: "Data Consent", icon: Shield },
];

const RISK_OPTIONS = [
  {
    value: "CONSERVATIVE",
    label: "Conservative",
    desc: "Prioritize capital preservation with stable returns",
  },
  {
    value: "MODERATE",
    label: "Moderate",
    desc: "Balance growth and stability across asset classes",
  },
  {
    value: "AGGRESSIVE",
    label: "Aggressive",
    desc: "Maximize long-term growth with higher risk tolerance",
  },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    riskTolerance: "MODERATE",
    investmentHorizonYears: 10,
    monthlySavingsCapacity: "",
    goalsIntent: "",
    valuesPreference: "ESG",
    consentAccepted: false,
  });

  const handleComplete = async () => {
    if (!form.consentAccepted) {
      toast.error("Please accept data use consent to continue.");
      return;
    }
    setLoading(true);
    const result = await saveRiskProfile({
      ...form,
      monthlySavingsCapacity: form.monthlySavingsCapacity
        ? Number(form.monthlySavingsCapacity)
        : undefined,
      onboardingCompleted: true,
      consentGivenAt: new Date(),
    });

    if (result.success) {
      toast.success("Profile saved! Welcome to Digital Wealth Advisor.");
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save profile");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "icon-ring h-10 w-10 mb-2 transition-colors",
                step >= s.id && "border-primary/50 bg-primary/10"
              )}
            >
              <s.icon className="h-4 w-4" />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="surface">
        <CardContent className="p-6 pt-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-xl">
                What&apos;s your risk tolerance?
              </h2>
              <p className="text-sm text-muted-foreground">
                This helps Arya tailor investment guidance to your comfort level.
              </p>
              <div className="space-y-3">
                {RISK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, riskTolerance: opt.value }))
                    }
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-colors",
                      form.riskTolerance === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-primary/30"
                    )}
                  >
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-xl">
                Investment horizon
              </h2>
              <p className="text-sm text-muted-foreground">
                How many years until you need this money?
              </p>
              <div className="space-y-2">
                <Label htmlFor="horizon">Years</Label>
                <Input
                  id="horizon"
                  type="number"
                  min={1}
                  max={50}
                  value={form.investmentHorizonYears}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      investmentHorizonYears: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-xl">
                Monthly savings capacity
              </h2>
              <p className="text-sm text-muted-foreground">
                How much can you set aside each month for savings and investments?
              </p>
              <div className="space-y-2">
                <Label htmlFor="savings">Amount ({CURRENCY_SYMBOL})</Label>
                <Input
                  id="savings"
                  type="number"
                  min={0}
                  placeholder="e.g. 2000"
                  value={form.monthlySavingsCapacity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      monthlySavingsCapacity: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-xl">
                What are your financial goals?
              </h2>
              <p className="text-sm text-muted-foreground">
                Tell Arya what you&apos;re working toward — retirement, home, education, etc.
              </p>
                <div className="space-y-2">
                  <Label htmlFor="values">Values-based investing</Label>
                  <select
                    id="values"
                    value={form.valuesPreference}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, valuesPreference: e.target.value }))
                    }
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="ESG">ESG / Sustainable</option>
                    <option value="TECH">Technology focus</option>
                    <option value="HALAL">Halal investing</option>
                    <option value="EXCLUDE_FOSSIL">Exclude fossil fuels</option>
                    <option value="BALANCED">Balanced (no preference)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Goals (optional)</Label>
                <Input
                  id="goals"
                  placeholder="e.g. Retirement fund and emergency savings"
                  value={form.goalsIntent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, goalsIntent: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-xl">
                Data use consent
              </h2>
              <p className="text-sm text-muted-foreground">
                Under India&apos;s DPDP Act, 2023, we need your consent to
                personalize guidance using your spending and investment data.
              </p>
              <label className="flex items-start gap-3 p-4 rounded-lg border border-border/60 cursor-pointer hover:border-primary/30">
                <input
                  type="checkbox"
                  checked={form.consentAccepted}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      consentAccepted: e.target.checked,
                    }))
                  }
                  className="mt-1"
                />
                <span className="text-sm">
                  I consent to YourBank using my transaction and portfolio data
                  to provide personalized financial education and goal-based
                  guidance. I can withdraw consent anytime in settings.
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < 5 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading || !form.consentAccepted}>
                {loading ? "Saving…" : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
