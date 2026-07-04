import { auth, currentUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { db } from "./prisma";

export const checkUser = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      throw new Error("User email is required");
    }

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      email;

    const newUser = await db.user.create({
      data: {
        clerkUserId: clerkUser.id,
        name,
        imageUrl: clerkUser.imageUrl,
        email,
      },
    });

    return newUser;
  } catch (error) {
    console.error("checkUser failed:", error.message);
    throw error;
  }
});
