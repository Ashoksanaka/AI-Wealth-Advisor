"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { riskProfileSchema } from "@/lib/schemas/wealth";
import { toNumber } from "@/lib/serialize";

async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await checkUser();
  if (!user) throw new Error("User not found");
  return user;
}

function serializeProfile(profile) {
  if (!profile) return null;
  return {
    ...profile,
    monthlySavingsCapacity: profile.monthlySavingsCapacity
      ? toNumber(profile.monthlySavingsCapacity)
      : null,
  };
}

export async function getRiskProfile() {
  const user = await getAuthUser();
  const profile = await db.riskProfile.findUnique({
    where: { userId: user.id },
  });
  return serializeProfile(profile);
}

export async function saveRiskProfile(data) {
  try {
    const user = await getAuthUser();
    const parsed = riskProfileSchema.parse(data);

    const profile = await db.riskProfile.upsert({
      where: { userId: user.id },
      update: parsed,
      create: { ...parsed, userId: user.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    return { success: true, data: serializeProfile(profile) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function isOnboardingComplete() {
  const user = await getAuthUser();
  const profile = await db.riskProfile.findUnique({
    where: { userId: user.id },
    select: { onboardingCompleted: true },
  });
  return profile?.onboardingCompleted ?? false;
}
