import { getApiUser } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { submitAdvisorFeedback } from "@/lib/services/advisor-service";

export async function POST(request) {
  const { user, error } = await getApiUser();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body", 400);
  }

  const { messageId, rating, comment } = body ?? {};
  if (!messageId || !rating) {
    return apiError("messageId and rating are required", 400);
  }

  if (!["HELPFUL", "NOT_HELPFUL"].includes(rating)) {
    return apiError("Invalid rating", 400);
  }

  const feedback = await submitAdvisorFeedback(
    user.id,
    messageId,
    rating,
    comment
  );
  return apiSuccess({ feedback });
}
