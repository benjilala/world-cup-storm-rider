"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/store/authStore";
import { useLiveStore } from "@/store/liveStore";
import { leaderboards, runs } from "@/lib/mock/storm";

function rel(ts: string, now: number): string {
  const sec = Math.max(0, Math.floor((now - new Date(ts).getTime()) / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m`;
}

function badgeForUser(userId: string) {
  const topTen = leaderboards.roi.some((entry) => entry.userId === userId);
  const hasActiveRun = runs.some((run) => run.userId === userId && run.status === "active");
  if (topTen) return "Top";
  if (hasActiveRun) return "Run";
  return null;
}

export function LiveChatPanel() {
  const { isAuthenticated, session, openAuthDialog } = useAuthStore();
  const chatFeed = useLiveStore((s) => s.chatFeed);
  const addChatMessage = useLiveStore((s) => s.addChatMessage);
  const nowMs = useLiveStore((s) => s.nowMs);
  const [text, setText] = useState("");

  const rows = useMemo(() => chatFeed.slice(-120), [chatFeed]);

  const send = () => {
    if (!isAuthenticated || !session || !text.trim()) return;
    addChatMessage({
      id: `chat-${Date.now()}`,
      userId: session.user.id,
      username: session.user.username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      matchId: "global",
    });
    setText("");
  };

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-950/80 p-3">
      <p className="mb-2 text-[11px] font-semibold tracking-widest text-zinc-300">LIVE CHAT</p>
      <ScrollArea className="h-[360px] pr-2">
        <div className="space-y-2">
          {rows.map((msg) => {
            const badge = badgeForUser(msg.userId);
            return (
              <div key={msg.id} className="rounded-md border border-zinc-800 bg-zinc-900/60 p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px]">{msg.username.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-zinc-100">{msg.username}</span>
                  {badge && (
                    <Badge variant="outline" className="h-5 text-[10px] text-emerald-300">
                      {badge}
                    </Badge>
                  )}
                  <span className="ml-auto text-[10px] text-zinc-500">{rel(msg.timestamp, nowMs)}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-300">{msg.text}</p>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="mt-3 border-t border-zinc-800 pt-2">
        {isAuthenticated ? (
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Say something..."
              className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-100"
            />
            <Button className="h-8 w-8 shrink-0 p-0" onClick={send}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="h-8 w-full text-xs" onClick={() => openAuthDialog()}>
            Sign in to chat
          </Button>
        )}
      </div>
    </div>
  );
}
