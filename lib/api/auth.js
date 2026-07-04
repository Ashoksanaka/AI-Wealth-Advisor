import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { apiError } from "./response";

export async function getApiUser() {
  const { userId } = await auth();
  if (!userId) {
    return { error: apiError("Unauthorized", 401) };
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    return { error: apiError("User not found", 404) };
  }

  return { user };
}
