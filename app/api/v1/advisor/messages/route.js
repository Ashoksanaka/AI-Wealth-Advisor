import { getApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getAdvisorMessages } from "@/lib/services/advisor-service";

export async function GET(request) {
  const { user, error } = await getApiUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  const { session, messages } = await getAdvisorMessages(
    user.id,
    sessionId,
    50
  );

  return apiSuccess({ session, messages });
}
