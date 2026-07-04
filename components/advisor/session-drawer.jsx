"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SessionDrawer({
  open,
  onOpenChange,
  sessions = [],
  activeSessionId,
  onSelectSession,
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md p-6 pb-8">
          <DrawerHeader>
            <DrawerTitle>Conversation history</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {sessions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No previous conversations yet.
              </p>
            )}
            {sessions.map((session) => (
              <Button
                key={session.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto py-3 px-3",
                  session.id === activeSessionId && "bg-accent"
                )}
                onClick={() => {
                  onSelectSession(session.id);
                  onOpenChange(false);
                }}
              >
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.title || "Conversation"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session._count?.messages ?? 0} messages ·{" "}
                    {formatDistanceToNow(new Date(session.updatedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
