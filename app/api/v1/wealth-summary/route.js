import { getApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getWealthSummaryForUser } from "@/lib/services/wealth-service";

export async function GET() {
  const { user, error } = await getApiUser();
  if (error) return error;

  const summary = await getWealthSummaryForUser(user.id);
  return apiSuccess(summary);
}
