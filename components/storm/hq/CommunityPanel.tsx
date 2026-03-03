"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  Send,
  Crown,
  Zap,
  Copy,
  TrendingUp,
  MessageCircle,
  BarChart3,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useLiveStore } from "@/store/liveStore";
import { leaderboards, runs } from "@/lib/mock/storm";

function rel(ts: string, now: number): string {
  const sec = Math.max(0, Math.floor((now - new Date(ts).getTime()) / 1000));
  if (sec < 5) return "now";
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  return `${min}m`;
}

function badgeForUser(userId: string) {
  const idx = leaderboards.roi.findIndex((e) => e.userId === userId);
  if (idx >= 0 && idx < 3) return "crown";
  const hasRun = runs.some((r) => r.userId === userId && r.status === "active");
  if (hasRun) return "run";
  return null;
}

function ChatSection() {
  const { isAuthenticated, session, openAuthDialog } = useAuthStore();
  const chatFeed = useLiveStore((s) => s.chatFeed);
  const addChatMessage = useLiveStore((s) => s.addChatMessage);
  const nowMs = useLiveStore((s) => s.nowMs);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => chatFeed.slice(-80), [chatFeed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rows.length]);

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
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 pr-1" ref={scrollRef}>
        <div className="space-y-1 p-2">
          {rows.map((msg) => {
            const badge = badgeForUser(msg.userId);
            return (
              <div key={msg.id} className="rounded px-2 py-1 hover:bg-storm-surface/60 transition-colors">
                <span className="inline-flex items-center gap-1">
                  {badge === "crown" && <Crown className="h-3 w-3 text-storm-gold" />}
                  {badge === "run" && <Zap className="h-3 w-3 text-storm-lightning" />}
                  <span className="text-[11px] font-semibold text-storm-accent">{msg.username}</span>
                  <span className="text-[10px] text-muted-foreground">{rel(msg.timestamp, nowMs)}</span>
                </span>
                <p className="text-xs text-foreground/90 leading-relaxed">{msg.text}</p>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t border-border/30 p-2">
        {isAuthenticated ? (
          <div className="flex gap-1.5">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Say something..."
              className="h-8 bg-storm-surface border-border/30 text-xs"
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

function BetsTicker() {
  const liveBets = useLiveStore((s) => s.liveBets);
  const nowMs = useLiveStore((s) => s.nowMs);
  const recent = useMemo(() => liveBets.slice(0, 30), [liveBets]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {recent.map((bet) => (
          <div
            key={bet.id}
            className={`flex items-center gap-2 rounded px-2 py-1.5 animate-slide-in-bet ${
              bet.isWhale
                ? "bg-storm-gold/5 border border-storm-gold/20"
                : "hover:bg-storm-surface/60"
            }`}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-[9px] bg-storm-surface">{bet.avatar}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold">{bet.username}</span>
              <p className="text-[10px] text-muted-foreground truncate">{bet.label}</p>
            </div>
            <span className={`text-[11px] font-mono font-bold shrink-0 ${bet.isWhale ? "text-storm-gold" : "text-foreground"}`}>
              ${bet.amount}
            </span>
            <span className="text-[9px] text-muted-foreground shrink-0">
              {rel(bet.timestamp, nowMs)}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function MiniLeaderboard() {
  const [tab, setTab] = useState<"roi" | "streak" | "copied">("roi");

  const data = useMemo(() => {
    const src =
      tab === "roi"
        ? leaderboards.roi
        : tab === "streak"
          ? leaderboards.streak
          : leaderboards.mostCopied;
    return src.slice(0, 8);
  }, [tab]);

  const podiumColors = ["text-storm-gold", "text-muted-foreground", "text-storm-ride"];

  return (
    <div className="p-2 space-y-2">
      <div className="flex gap-1">
        {(["roi", "streak", "copied"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === t
                ? "bg-storm-surface text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "roi" ? "ROI" : t === "streak" ? "Streak" : "Copied"}
          </button>
        ))}
      </div>
      <div className="space-y-0.5">
        {data.map((entry, i) => (
          <div
            key={entry.userId}
            className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-storm-surface/60 transition-colors"
          >
            <span className={`w-4 text-[11px] font-bold ${i < 3 ? podiumColors[i] : "text-muted-foreground"}`}>
              {i + 1}
            </span>
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="text-[9px] bg-storm-surface">{entry.avatar}</AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-semibold flex-1 truncate">{entry.username}</span>
            <span className="text-[11px] font-mono text-storm-live">{entry.label}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhosHere() {
  const viewerCount = useLiveStore((s) => s.viewerCount);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex items-center gap-2 p-3">
      <div className="h-2 w-2 rounded-full bg-storm-live animate-pulse" />
      <span className="text-xs text-muted-foreground">
        {mounted ? viewerCount.toLocaleString() : "---"} watching
      </span>
      <div className="flex -space-x-1.5 ml-auto">
        {["BK", "SX", "VH", "MR", "AE"].map((initials) => (
          <Avatar key={initials} className="h-6 w-6 border-2 border-background">
            <AvatarFallback className="text-[8px] bg-storm-surface">{initials}</AvatarFallback>
          </Avatar>
        ))}
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-storm-surface border-2 border-background text-[8px] text-muted-foreground font-bold">
          +{mounted ? Math.max(0, viewerCount - 5) : "..."}
        </div>
      </div>
    </div>
  );
}

export function CommunityPanel() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/30 px-3 py-2">
        <Users className="h-4 w-4 text-storm-accent" />
        <span className="text-xs font-bold tracking-wide">COMMUNITY</span>
      </div>

      <WhosHere />

      <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-2 mb-0 bg-storm-surface h-8">
          <TabsTrigger value="chat" className="text-[10px] gap-1 h-6">
            <MessageCircle className="h-3 w-3" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="bets" className="text-[10px] gap-1 h-6">
            <TrendingUp className="h-3 w-3" />
            Bets
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-[10px] gap-1 h-6">
            <BarChart3 className="h-3 w-3" />
            Leaders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col">
          <ChatSection />
        </TabsContent>
        <TabsContent value="bets" className="flex-1 overflow-hidden mt-0">
          <BetsTicker />
        </TabsContent>
        <TabsContent value="leaderboard" className="flex-1 overflow-hidden mt-0">
          <MiniLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
