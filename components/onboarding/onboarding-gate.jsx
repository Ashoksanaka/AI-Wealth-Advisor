"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function OnboardingGate({ complete, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnboarding = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (!complete && !isOnboarding) {
      router.replace("/onboarding");
    }
  }, [complete, isOnboarding, router]);

  if (!complete && !isOnboarding) {
    return null;
  }

  return children;
}
