import { getApiUser } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { sendAdvisorChat } from "@/lib/services/advisor-service";

export async function POST(request) {
  const { user, error } = await getApiUser();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const message = body?.message?.trim();
  const sessionId = body?.sessionId ?? null;
  if (!message) return apiError("Message is required", 400);

  const result = await sendAdvisorChat(user.id, message, sessionId);
  return apiSuccess(result);
}
