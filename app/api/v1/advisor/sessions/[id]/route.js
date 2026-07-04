import { getApiUser } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import {
  deleteAdvisorSession,
  clearAdvisorSession,
} from "@/lib/services/advisor-service";

export async function DELETE(_request, { params }) {
  const { user, error } = await getApiUser();
  if (error) return error;

  const { id } = await params;
  if (!id) return apiError("Session id required", 400);

  await deleteAdvisorSession(user.id, id);
  return apiSuccess({ success: true });
}

export async function PATCH(request, { params }) {
  const { user, error } = await getApiUser();
  if (error) return error;

  const { id } = await params;
  if (!id) return apiError("Session id required", 400);

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  if (body?.action === "clear") {
    await clearAdvisorSession(user.id, id);
    return apiSuccess({ success: true });
  }

  return apiError("Unknown action", 400);
}
