"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { holdingSchema } from "@/lib/schemas/wealth";
import { serializeDecimalFields } from "@/lib/serialize";

async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await checkUser();
  if (!user) throw new Error("User not found");
  return user;
}

function serializeHolding(holding) {
  return serializeDecimalFields(holding, [
    "quantity",
    "avgBuyPrice",
    "currentPrice",
  ]);
}

export async function getHoldings() {
  const user = await getAuthUser();
  const holdings = await db.investmentHolding.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return holdings.map(serializeHolding);
}

export async function createHolding(data) {
  try {
    const user = await getAuthUser();
    const parsed = holdingSchema.parse(data);

    const holding = await db.investmentHolding.create({
      data: { ...parsed, userId: user.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/portfolio");
    return { success: true, data: serializeHolding(holding) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateHolding(id, data) {
  try {
    const user = await getAuthUser();
    const parsed = holdingSchema.parse(data);

    const holding = await db.investmentHolding.update({
      where: { id, userId: user.id },
      data: parsed,
    });

    revalidatePath("/dashboard");
    revalidatePath("/portfolio");
    return { success: true, data: serializeHolding(holding) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteHolding(id) {
  try {
    const user = await getAuthUser();
    await db.investmentHolding.delete({
      where: { id, userId: user.id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/portfolio");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
