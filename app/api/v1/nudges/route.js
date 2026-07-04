import { getApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getNudgesForUser } from "@/lib/services/wealth-service";

export async function GET() {
  const { user, error } = await getApiUser();
  if (error) return error;

  const nudges = await getNudgesForUser(user.id);
  return apiSuccess(nudges);
}
