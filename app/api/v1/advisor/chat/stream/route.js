import { getApiUser } from "@/lib/api/auth";
import { streamAdvisorChat } from "@/lib/services/advisor-service";

export const runtime = "nodejs";

function sseEncode(data) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request) {
  const { user, error } = await getApiUser();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(sseEncode({ type: "error", message: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const message = body?.message?.trim();
  const sessionId = body?.sessionId ?? null;
  if (!message) {
    return new Response(sseEncode({ type: "error", message: "Message required" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event) => controller.enqueue(encoder.encode(sseEncode(event)));

      send({ type: "started" });

      try {
        const chat = await streamAdvisorChat(user.id, message, sessionId);

        if (chat.immediate) {
          send({ type: "token", text: chat.immediate.text || "" });
          send({
            type: "done",
            sessionId: chat.sessionId,
            parsed: chat.immediate,
            assistantMessage: chat.assistantMessage,
          });
          controller.close();
          return;
        }

        let accumulated = "";
        try {
          for await (const token of chat.stream) {
            accumulated += token;
            send({ type: "token", text: token });
          }
          const { parsed, assistantMessage } = await chat.persist(accumulated);
          send({
            type: "done",
            sessionId: chat.sessionId,
            parsed,
            assistantMessage,
          });
        } catch (streamError) {
          console.error("Stream error, falling back:", streamError);
          const { parsed, assistantMessage } = await chat.fallback();
          send({ type: "token", text: parsed.text || "" });
          send({
            type: "done",
            sessionId: chat.sessionId,
            parsed,
            assistantMessage,
          });
        }
      } catch (err) {
        console.error("Advisor stream error:", err);
        send({
          type: "error",
          parsed: {
            text: "I'm having trouble reaching the vault right now. Let's try again in a moment.",
            actions: [],
          },
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
