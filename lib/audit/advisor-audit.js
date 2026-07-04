import { db } from "@/lib/prisma";

export async function logAdvisorEvent(userId, event, metadata = {}) {
  try {
    await db.advisorAuditEvent.create({
      data: { userId, event, metadata },
    });
  } catch (error) {
    console.error("Advisor audit log error:", error);
  }
}
