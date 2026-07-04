"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { goalSchema } from "@/lib/schemas/wealth";
import { serializeDecimalFields } from "@/lib/serialize";

async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await checkUser();
  if (!user) throw new Error("User not found");
  return user;
}

function serializeGoal(goal) {
  return serializeDecimalFields(goal, ["targetAmount", "currentAmount"]);
}

export async function getGoals() {
  const user = await getAuthUser();
  const goals = await db.financialGoal.findMany({
    where: { userId: user.id },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });
  return goals.map(serializeGoal);
}

export async function createGoal(data) {
  try {
    const user = await getAuthUser();
    const parsed = goalSchema.parse(data);

    const goal = await db.financialGoal.create({
      data: { ...parsed, userId: user.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/goals");
    return { success: true, data: serializeGoal(goal) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateGoal(id, data) {
  try {
    const user = await getAuthUser();
    const parsed = goalSchema.parse(data);

    const goal = await db.financialGoal.update({
      where: { id, userId: user.id },
      data: parsed,
    });

    revalidatePath("/dashboard");
    revalidatePath("/goals");
    return { success: true, data: serializeGoal(goal) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteGoal(id) {
  try {
    const user = await getAuthUser();
    await db.financialGoal.delete({
      where: { id, userId: user.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/goals");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
