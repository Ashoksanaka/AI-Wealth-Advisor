import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { PageHeader } from "@/components/page-header";
import { UserCheck } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div>
      <PageHeader
        title="Build Your Wealth Profile"
        subtitle="Help Arya understand your financial goals and risk preferences"
        icon={UserCheck}
      />
      <OnboardingWizard />
    </div>
  );
}
