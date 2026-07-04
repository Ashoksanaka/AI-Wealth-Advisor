"use server";

import { revalidatePath } from "next/cache";
import { checkUser } from "@/lib/checkUser";
import { advisorMessageSchema } from "@/lib/schemas/wealth";
import {
  listAdvisorSessions,
  createAdvisorSession,
  getAdvisorMessages,
  sendAdvisorChat,
  clearAdvisorSession,
  deleteAdvisorSession,
  submitAdvisorFeedback,
} from "@/lib/services/advisor-service";

async function getAuthUser() {
  const user = await checkUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getAdvisorSessions() {
  const user = await getAuthUser();
  return listAdvisorSessions(user.id);
}

export async function getAdvisorHistory(sessionId, limit = 50) {
  const user = await getAuthUser();
  const { session, messages } = await getAdvisorMessages(
    user.id,
    sessionId,
    limit
  );
  return { session, messages };
}

export async function startNewAdvisorSession() {
  const user = await getAuthUser();
  const session = await createAdvisorSession(user.id);
  revalidatePath("/advisor");
  revalidatePath("/dashboard");
  return { success: true, session };
}

export async function sendAdvisorMessage(message, sessionId) {
  try {
    const user = await getAuthUser();
    advisorMessageSchema.parse({ message });

    const result = await sendAdvisorChat(user.id, message, sessionId);

    revalidatePath("/advisor");
    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function clearAdvisorHistory(sessionId) {
  try {
    const user = await getAuthUser();
    await clearAdvisorSession(user.id, sessionId);
    revalidatePath("/advisor");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function removeAdvisorSession(sessionId) {
  try {
    const user = await getAuthUser();
    await deleteAdvisorSession(user.id, sessionId);
    revalidatePath("/advisor");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function submitMessageFeedback(messageId, rating, comment) {
  try {
    const user = await getAuthUser();
    const feedback = await submitAdvisorFeedback(
      user.id,
      messageId,
      rating,
      comment
    );
    revalidatePath("/advisor");
    revalidatePath("/dashboard");
    return { success: true, data: feedback };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
