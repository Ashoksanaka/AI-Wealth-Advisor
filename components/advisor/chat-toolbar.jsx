"use client";

import {
  Maximize2,
  X,
  MoreVertical,
  Plus,
  History,
  Trash2,
  Shield,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdvisorAvatar } from "./advisor-avatar";
import { AdvisorThinkingStatus } from "./advisor-thinking-status";
import { cn } from "@/lib/utils";

export function ChatToolbar({
  sessionId,
  mode = "page",
  onClose,
  onMaximize,
  onNewChat,
  onShowHistory,
  onClearHistory,
  avatarState = "idle",
  thinking = false,
  ttsEnabled,
  onToggleTts,
}) {
  const shortSessionId = sessionId ? sessionId.slice(0, 8) : "—";
  const showAvatar = mode === "widget" || mode === "page";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/60 bg-card/80 shrink-0",
        mode === "page" && "py-2"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {showAvatar && (
          <AdvisorAvatar
            state={avatarState}
            thinking={thinking}
            size="xs"
            showLabel={false}
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">Arya</p>
          {thinking ? (
            <AdvisorThinkingStatus compact className="text-[10px] text-primary mt-0.5" />
          ) : (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Shield className="h-2.5 w-2.5" />
              {mode === "page" ? "Digital Wealth Advisor" : `Session ${shortSessionId}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {mode === "page" && onToggleTts && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleTts}
            aria-label={ttsEnabled ? "Mute voice output" : "Enable voice output"}
          >
            {ttsEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Chat options">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowHistory}>
              <History className="h-4 w-4 mr-2" />
              History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onClearHistory} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {mode === "widget" && onMaximize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onMaximize}
            aria-label="Open full advisor"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        )}

        {mode === "widget" && onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
