import { getApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getCachedInsights } from "@/lib/services/wealth-service";

export async function GET() {
  const { user, error } = await getApiUser();
  if (error) return error;

  const insights = await getCachedInsights(user.id);
  return apiSuccess(insights);
}
