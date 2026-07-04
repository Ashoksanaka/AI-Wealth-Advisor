import { getApiUser } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { db } from "@/lib/prisma";
import { toNumber } from "@/lib/serialize";

export async function GET() {
  const { user, error } = await getApiUser();
  if (error) return error;

  const [dbUser, riskProfile] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, imageUrl: true },
    }),
    db.riskProfile.findUnique({ where: { userId: user.id } }),
  ]);

  return apiSuccess({
    user: dbUser,
    riskProfile: riskProfile
      ? {
          ...riskProfile,
          monthlySavingsCapacity: riskProfile.monthlySavingsCapacity
            ? toNumber(riskProfile.monthlySavingsCapacity)
            : null,
        }
      : null,
  });
}
