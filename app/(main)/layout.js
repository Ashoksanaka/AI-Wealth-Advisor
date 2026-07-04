import React from "react";
import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";

const MainLayout = async ({ children }) => {
  const user = await checkUser();

  let onboardingComplete = false;
  if (user) {
    const profile = await db.riskProfile.findUnique({
      where: { userId: user.id },
      select: { onboardingCompleted: true },
    });
    onboardingComplete = profile?.onboardingCompleted ?? false;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 my-24 sm:my-28 max-w-6xl fade-in">
      <OnboardingGate complete={onboardingComplete}>{children}</OnboardingGate>
    </div>
  );
};

export default MainLayout;
