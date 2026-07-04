"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Send, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdvisorAvatar } from "./advisor-avatar";
import { HandoffCard } from "./handoff-card";
import { DisclaimerBanner } from "@/components/compliance/disclaimer-banner";
import { ChatToolbar } from "./chat-toolbar";
import { SessionDrawer } from "./session-drawer";
import { MessageFeedback } from "./message-feedback";
import { ChatMessageXai } from "./chat-message-xai";
import { ChatActionWidgets } from "./chat-action-widgets";
import { AdvisorThinkingStatus } from "./advisor-thinking-status";
import {
  getAdvisorHistory,
  getAdvisorSessions,
  startNewAdvisorSession,
  clearAdvisorHistory,
} from "@/actions/advisor";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  { label: "How am I doing?", href: null },
  { label: "Walk me through my dashboard", href: null },
  { label: "Review spending", href: null },
  { label: "Talk to human", href: null },
];

function QuickPromptsBar({ prompts, loading, onSend, compact = false }) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 sm:gap-2",
        compact ? "justify-center" : "justify-start"
      )}
    >
      {prompts.map((prompt) =>
        prompt.href ? (
          <Link
            key={prompt.label}
            href={prompt.href}
            className={cn(
              "rounded-full border border-border/60 bg-accent/30 hover:bg-accent/60",
              compact ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1.5"
            )}
          >
            {prompt.label}
          </Link>
        ) : (
          <button
            key={prompt.label}
            type="button"
            onClick={() => onSend(prompt.label)}
            disabled={loading}
            className={cn(
              "rounded-full border border-border/60 bg-accent/30 hover:bg-accent/60 disabled:opacity-50",
              compact ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1.5"
            )}
          >
            {prompt.label}
          </button>
        )
      )}
    </div>
  );
}

function parseMessageContent(content) {
  try {
    const parsed = JSON.parse(content);
    if (parsed.text) return parsed;
  } catch {
    // plain text
  }
  return { text: content, actions: [] };
}

function useTypingEffect(text, active, speed = 12) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, active, speed]);

  return displayed;
}

function AssistantBubble({ msg, parsed, streamingText, isStreaming, large = false }) {
  const staticText = parsed.text || "";
  const typedText = useTypingEffect(
    staticText,
    !isStreaming && !msg.id.startsWith("temp-")
  );
  const displayText = isStreaming ? streamingText : typedText;

  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed",
        "bg-accent/50 border border-border/40 rounded-bl-md",
        large ? "text-[15px]" : "text-sm"
      )}
      aria-label="Arya reply"
      aria-live={isStreaming ? "polite" : undefined}
    >
      {displayText ? (
        <p>{displayText}</p>
      ) : isStreaming ? (
        <AdvisorThinkingStatus compact />
      ) : null}
      {!isStreaming && parsed.handoff && (
        <HandoffCard ticketId={parsed.ticketId} summary={parsed.summary} />
      )}
      {!isStreaming && (
        <>
          <ChatActionWidgets actions={parsed.actions} />
          <ChatMessageXai
            reasoning={parsed.reasoning}
            dataPoints={parsed.dataPoints}
          />
          {!msg.id.startsWith("temp-") && (
            <MessageFeedback
              messageId={msg.id}
              existingFeedback={msg.feedback}
            />
          )}
        </>
      )}
    </div>
  );
}

export function AdvisorChat({
  mode = "page",
  sessionId: initialSessionId,
  initialMessages = [],
  initialGreeting = null,
  enableTtsDefault = true,
  compact = false,
  onClose,
  onMaximize,
}) {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [messages, setMessages] = useState(initialMessages);
  const [sessions, setSessions] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingId, setStreamingId] = useState(null);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(enableTtsDefault);
  const [avatarState, setAvatarState] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastSpokenRef = useRef("");

  const loadSession = useCallback(async (id) => {
    const result = await getAdvisorHistory(id);
    setSessionId(result.session.id);
    setMessages(result.messages);
  }, []);

  const refreshSessions = useCallback(async () => {
    const list = await getAdvisorSessions();
    setSessions(list);
  }, []);

  useEffect(() => {
    if (messages.length === 0 && !loading && !streamingText) return;
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading, streamingText]);

  const speakText = useCallback((text) => {
    if (!ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }
    const trimmed = text?.trim();
    if (!trimmed || trimmed === lastSpokenRef.current) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.rate = 1;
    utterance.onstart = () => setAvatarState("speaking");
    utterance.onend = () => setAvatarState("idle");
    utterance.onerror = () => setAvatarState("idle");
    lastSpokenRef.current = trimmed;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = false;
        recognitionRef.current.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          setInput(transcript);
          setListening(false);
          setAvatarState("idle");
        };
        recognitionRef.current.onerror = () => {
          setListening(false);
          setAvatarState("idle");
        };
        recognitionRef.current.onend = () => setListening(false);
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      setErrorMsg("Voice input is not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      setAvatarState("idle");
    } else {
      setListening(true);
      setAvatarState("speaking");
      recognitionRef.current.start();
    }
  };

  const handleSend = async (text) => {
    const message = text.trim();
    if (!message || loading) return;

    setInput("");
    setLoading(true);
    setErrorMsg(null);
    setStreamingText("");
    setAvatarState(
      message.toLowerCase().includes("worried") ||
        message.toLowerCase().includes("panic")
        ? "concerned"
        : "thinking"
    );

    const optimisticUser = {
      id: `temp-user-${Date.now()}`,
      role: "USER",
      content: message,
      createdAt: new Date().toISOString(),
    };
    const streamPlaceholder = {
      id: `temp-stream-${Date.now()}`,
      role: "ASSISTANT",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setStreamingId(streamPlaceholder.id);
    setMessages((prev) => [...prev, optimisticUser, streamPlaceholder]);

    try {
      const response = await fetch("/api/v1/advisor/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let finalPayload = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const dataLine = line.replace(/^data: /, "").trim();
          if (!dataLine) continue;
          try {
            const event = JSON.parse(dataLine);
            if (event.type === "token") {
              accumulated += event.text;
              setStreamingText(accumulated);
            } else if (event.type === "done") {
              finalPayload = event;
            } else if (event.type === "error") {
              finalPayload = { parsed: event.parsed, sessionId };
            }
          } catch {
            // ignore parse errors
          }
        }
      }

      if (finalPayload?.sessionId) setSessionId(finalPayload.sessionId);

      const assistantMessage = finalPayload?.assistantMessage || {
        id: `assistant-${Date.now()}`,
        role: "ASSISTANT",
        content: JSON.stringify(
          finalPayload?.parsed || {
            text: accumulated || "I'm here to help with your finances.",
            actions: [],
          }
        ),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev.filter(
          (m) =>
            m.id !== optimisticUser.id &&
            m.id !== streamPlaceholder.id
        ),
        {
          id: `user-${Date.now()}`,
          role: "USER",
          content: message,
          createdAt: new Date().toISOString(),
        },
        assistantMessage,
      ]);
      setStreamingId(null);
      setStreamingText("");
      setAvatarState("idle");
      refreshSessions();

      const replyText =
        finalPayload?.parsed?.text || accumulated || assistantMessage.content;
      let spoken = replyText;
      try {
        const parsed = JSON.parse(assistantMessage.content);
        spoken = parsed.text || spoken;
      } catch {
        // plain text
      }
      speakText(spoken);
    } catch {
      setMessages((prev) =>
        prev.filter(
          (m) =>
            m.id !== optimisticUser.id && m.id !== streamPlaceholder.id
        )
      );
      setStreamingId(null);
      setStreamingText("");
      setErrorMsg(
        "I'm having trouble reaching the vault right now. Let's try again in a moment."
      );
      setAvatarState("concerned");
    }

    setLoading(false);
  };

  const handleNewChat = async () => {
    const result = await startNewAdvisorSession();
    if (result.success) {
      setSessionId(result.session.id);
      setMessages([]);
      refreshSessions();
    }
  };

  const handleShowHistory = async () => {
    await refreshSessions();
    setHistoryOpen(true);
  };

  const handleClearHistory = async () => {
    if (!sessionId) return;
    if (!window.confirm("Clear all messages in this conversation?")) return;
    const result = await clearAdvisorHistory(sessionId);
    if (result.success) {
      setMessages([]);
      refreshSessions();
    }
  };

  const handleSelectSession = async (id) => {
    await loadSession(id);
  };

  const toggleTts = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTtsEnabled((v) => !v);
    setAvatarState("idle");
  };

  const isWidget = mode === "widget";
  const isPage = mode === "page";
  const showAvatarHeader = !isWidget && !compact && !isPage;

  const messagesContent = (
    <>
      {messages.length === 0 && !loading && (
        <div className="text-center text-muted-foreground py-8 px-4">
          {!isPage && (
            <div className="mx-auto mb-2 w-fit">
              <AdvisorAvatar state="idle" size="sm" showLabel={false} />
            </div>
          )}
          <p className={cn("text-sm", isPage && "text-base max-w-lg mx-auto")}>
            {initialGreeting?.text ||
              "Hi! I'm Arya, your digital wealth advisor. Ask me anything about your spending, investments, or financial goals."}
          </p>
        </div>
      )}
      {messages.map((msg) => {
        const parsed =
          msg.role === "ASSISTANT"
            ? msg.id === streamingId
              ? { text: streamingText, actions: [] }
              : parseMessageContent(msg.content)
            : { text: msg.content, actions: [] };

        const isStreaming = msg.id === streamingId && loading;

        return (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "USER" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "USER" ? (
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 leading-relaxed bg-primary text-primary-foreground rounded-br-md",
                  isPage
                    ? "max-w-[85%] text-[15px]"
                    : "max-w-[85%] text-sm"
                )}
                aria-label="Your message"
              >
                <p>{parsed.text}</p>
              </div>
            ) : (
              <AssistantBubble
                msg={msg}
                parsed={parsed}
                streamingText={streamingText}
                isStreaming={isStreaming}
                large={isPage}
              />
            )}
          </div>
        );
      })}
      {loading && !streamingId && (
        <div className="flex justify-start" aria-label="Arya is responding">
          <div className="bg-accent/50 border border-border/40 rounded-2xl rounded-bl-md px-4 py-3">
            <AdvisorThinkingStatus compact />
          </div>
        </div>
      )}
      {errorMsg && (
        <p
          className="text-sm text-amber-500/90 text-center px-4"
          role="alert"
        >
          {errorMsg}
        </p>
      )}
      <div ref={bottomRef} />
    </>
  );

  const inputForm = (
    <form
      className={cn(
        "border-t border-border/60 space-y-2 shrink-0",
        isPage ? "bg-muted/20 p-4 sm:p-5" : "p-3"
      )}
      onSubmit={(e) => {
        e.preventDefault();
        handleSend(input);
      }}
    >
      <div className={cn(isPage && "max-w-4xl mx-auto w-full space-y-3")}>
        <QuickPromptsBar
          prompts={
            isWidget || compact ? QUICK_PROMPTS.slice(0, 3) : QUICK_PROMPTS
          }
          loading={loading}
          onSend={handleSend}
          compact={isWidget || compact}
        />
        <div className={cn("flex gap-2", isPage && "items-end")}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Arya…"
            disabled={loading}
            className={cn("flex-1", isPage && "min-h-12 rounded-xl text-[15px]")}
            aria-label="Message to Arya"
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={toggleVoice}
            className={isPage ? "h-12 w-12 shrink-0 rounded-xl" : undefined}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
          >
            {listening ? (
              <MicOff className="h-4 w-4 text-primary" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className={isPage ? "h-12 w-12 shrink-0 rounded-xl" : undefined}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isWidget && <DisclaimerBanner />}
      </div>
    </form>
  );

  return (
    <div
      className={cn(
        "flex flex-col",
        isWidget
          ? "h-full"
          : compact
            ? "h-full"
            : isPage
              ? "flex flex-1 min-h-0 w-full max-w-6xl mx-auto"
              : "h-full w-full max-w-3xl mx-auto"
      )}
    >
      {isPage ? (
        <div className="flex flex-1 flex-col min-h-0 surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <ChatToolbar
            sessionId={sessionId}
            mode={mode}
            onClose={onClose}
            onMaximize={onMaximize}
            onNewChat={handleNewChat}
            onShowHistory={handleShowHistory}
            onClearHistory={handleClearHistory}
            avatarState={avatarState}
            thinking={loading}
            ttsEnabled={ttsEnabled}
            onToggleTts={toggleTts}
          />
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto min-h-0"
            role="log"
            aria-label="Chat with Arya"
            aria-live="polite"
          >
            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 space-y-4">
              {messagesContent}
            </div>
          </div>
          {inputForm}
        </div>
      ) : (
        <>
          <ChatToolbar
            sessionId={sessionId}
            mode={mode}
            onClose={onClose}
            onMaximize={onMaximize}
            onNewChat={handleNewChat}
            onShowHistory={handleShowHistory}
            onClearHistory={handleClearHistory}
            avatarState={avatarState}
            thinking={loading}
            ttsEnabled={mode === "widget" ? undefined : ttsEnabled}
            onToggleTts={mode === "widget" ? undefined : toggleTts}
          />

          {showAvatarHeader && (
            <div className="surface rounded-xl border border-border/60 shrink-0 p-6 mb-4 mt-4">
              <div className="flex items-center justify-between gap-3">
                <AdvisorAvatar
                  state={avatarState}
                  thinking={loading}
                  size={compact ? "sm" : "md"}
                  showLabel
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  onClick={toggleTts}
                  aria-label={ttsEnabled ? "Mute voice output" : "Enable voice output"}
                >
                  {ttsEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div
            className={cn(
              "flex-1 flex flex-col border border-border/60",
              isWidget
                ? "min-h-0"
                : compact
                  ? "surface rounded-xl min-h-[360px]"
                  : "surface rounded-xl min-h-[400px] max-h-[60vh]"
            )}
          >
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto space-y-3 min-h-0 p-4"
              role="log"
              aria-label="Chat with Arya"
              aria-live="polite"
            >
              {messagesContent}
            </div>
            {inputForm}
          </div>
        </>
      )}

      <SessionDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        sessions={sessions}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
      />
    </div>
  );
}
