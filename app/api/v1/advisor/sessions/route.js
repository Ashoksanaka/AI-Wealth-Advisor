import { getApiUser } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import {
  listAdvisorSessions,
  createAdvisorSession,
} from "@/lib/services/advisor-service";

export async function GET() {
  const { user, error } = await getApiUser();
  if (error) return error;

  const sessions = await listAdvisorSessions(user.id);
  return apiSuccess({ sessions });
}

export async function POST(request) {
  const { user, error } = await getApiUser();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const title = body?.title?.trim() || "New conversation";
  const session = await createAdvisorSession(user.id, title);
  return apiSuccess({ session });
}
