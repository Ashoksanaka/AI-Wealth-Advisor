"use server";

import { checkUser } from "@/lib/checkUser";
import {
  getWealthSummaryForUser,
  getCachedInsights,
  getNudgesForUser,
} from "@/lib/services/wealth-service";
import { buildWealthContext, getColdStartGreeting } from "@/lib/wealth-advisor";

async function getAuthUser() {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getWealthSummary() {
  const user = await getAuthUser();
  return getWealthSummaryForUser(user.id);
}

export async function getWealthInsights() {
  const user = await getAuthUser();
  return getCachedInsights(user.id);
}

export async function getContextualNudges() {
  const user = await getAuthUser();
  return getNudgesForUser(user.id);
}

export async function getAdvisorGreeting() {
  const user = await getAuthUser();
  const context = await buildWealthContext(user.id);
  return getColdStartGreeting(context);
}
