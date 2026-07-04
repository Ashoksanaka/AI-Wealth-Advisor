import { db } from "@/lib/prisma";
import {
  chatWithAdvisor,
  streamAdvisorReply,
  enrichAdvisorReply,
  parseAdvisorResponse,
} from "@/lib/wealth-advisor";
import { logAdvisorEvent } from "@/lib/audit/advisor-audit";

async function prepareAdvisorChatTurn(userId, message, sessionId) {
  const session = await getOrCreateActiveSession(userId, sessionId);

  const history = await db.advisorMessage.findMany({
    where: { userId, sessionId: session.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  await db.advisorMessage.create({
    data: { role: "USER", content: message, userId, sessionId: session.id },
  });

  if (!session.title || session.title === "New conversation") {
    const title = message.slice(0, 60) + (message.length > 60 ? "…" : "");
    await db.advisorSession.update({
      where: { id: session.id },
      data: { title, updatedAt: new Date() },
    });
  } else {
    await db.advisorSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });
  }

  return { session, history: history.reverse() };
}

async function persistAdvisorReply(userId, sessionId, reply) {
  const content = typeof reply === "string" ? reply : JSON.stringify(reply);

  const assistantMessage = await db.advisorMessage.create({
    data: {
      role: "ASSISTANT",
      content,
      userId,
      sessionId,
    },
    include: { feedback: true },
  });

  return {
    assistantMessage,
    parsed: typeof reply === "object" ? reply : { text: reply, actions: [] },
  };
}

export async function sendAdvisorChat(userId, message, sessionId) {
  const { session, history } = await prepareAdvisorChatTurn(
    userId,
    message,
    sessionId
  );

  const reply = await chatWithAdvisor(userId, message, history);
  const { assistantMessage, parsed } = await persistAdvisorReply(
    userId,
    session.id,
    reply
  );

  await logAdvisorEvent(userId, "message.send", {
    sessionId: session.id,
    messageLength: message.length,
  });

  return {
    sessionId: session.id,
    userMessage: message,
    assistantMessage,
    parsed,
  };
}

export async function streamAdvisorChat(userId, message, sessionId) {
  const { session, history } = await prepareAdvisorChatTurn(
    userId,
    message,
    sessionId
  );

  const result = await streamAdvisorReply(userId, message, history);

  if (result.immediate) {
    const { assistantMessage, parsed } = await persistAdvisorReply(
      userId,
      session.id,
      result.immediate
    );
    await logAdvisorEvent(userId, "message.send", {
      sessionId: session.id,
      messageLength: message.length,
      streamed: false,
    });
    return { sessionId: session.id, immediate: parsed, assistantMessage };
  }

  return {
    sessionId: session.id,
    stream: result.stream,
    context: result.context,
    notes: result.notes,
    persist: async (rawText) => {
      const parsed = enrichAdvisorReply(
        parseAdvisorResponse(rawText.trim()),
        result.context,
        result.notes
      );
      const { assistantMessage } = await persistAdvisorReply(
        userId,
        session.id,
        parsed
      );
      await logAdvisorEvent(userId, "message.send", {
        sessionId: session.id,
        messageLength: message.length,
        streamed: true,
      });
      return { parsed, assistantMessage };
    },
    fallback: async () => {
      const reply = await chatWithAdvisor(userId, message, history);
      const { assistantMessage, parsed } = await persistAdvisorReply(
        userId,
        session.id,
        reply
      );
      await logAdvisorEvent(userId, "message.send", {
        sessionId: session.id,
        messageLength: message.length,
        streamed: false,
        fallback: true,
      });
      return { parsed, assistantMessage };
    },
  };
}

export async function listAdvisorSessions(userId) {
  return db.advisorSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
    },
  });
}

export async function createAdvisorSession(userId, title = "New conversation") {
  const session = await db.advisorSession.create({
    data: { userId, title },
  });
  await logAdvisorEvent(userId, "session.create", { sessionId: session.id });
  return session;
}

export async function getOrCreateActiveSession(userId, sessionId) {
  if (sessionId) {
    const existing = await db.advisorSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (existing) return existing;
  }

  const latest = await db.advisorSession.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  if (latest) return latest;

  return createAdvisorSession(userId);
}

export async function getAdvisorMessages(userId, sessionId, limit = 50) {
  const session = await getOrCreateActiveSession(userId, sessionId);
  const messages = await db.advisorMessage.findMany({
    where: { userId, sessionId: session.id },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: { feedback: true },
  });
  return { session, messages };
}

export async function clearAdvisorSession(userId, sessionId) {
  const session = await db.advisorSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) throw new Error("Session not found");

  await db.advisorMessage.deleteMany({
    where: { userId, sessionId: session.id },
  });

  await logAdvisorEvent(userId, "session.clear", { sessionId: session.id });
  return { success: true, sessionId: session.id };
}

export async function deleteAdvisorSession(userId, sessionId) {
  const session = await db.advisorSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) throw new Error("Session not found");

  await db.advisorSession.delete({ where: { id: session.id } });
  await logAdvisorEvent(userId, "session.delete", { sessionId: session.id });
  return { success: true };
}

export async function submitAdvisorFeedback(
  userId,
  messageId,
  rating,
  comment
) {
  const message = await db.advisorMessage.findFirst({
    where: { id: messageId, userId, role: "ASSISTANT" },
  });
  if (!message) throw new Error("Message not found");

  const existing = await db.advisorFeedback.findUnique({
    where: { messageId },
  });
  if (existing) return existing;

  const feedback = await db.advisorFeedback.create({
    data: {
      messageId,
      userId,
      rating,
      comment: comment || null,
    },
  });

  await logAdvisorEvent(userId, "feedback.submit", {
    messageId,
    rating,
    sessionId: message.sessionId,
  });

  return feedback;
}
