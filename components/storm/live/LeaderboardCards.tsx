"use client";

import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { leaderboards } from "@/lib/mock/storm";
import { useAuthStore } from "@/store/authStore";

const BOARDS = [
  { key: "roi", label: "ROI Leaders" },
  { key: "streak", label: "Hot Streaks" },
  { key: "mostCopied", label: "Most Copied" },
] as const;

export function LeaderboardCards() {
  const { isAuthenticated, openAuthDialog } = useAuthStore();

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {BOARDS.map((board) => (
        <Card key={board.key} className="border-zinc-700 bg-zinc-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-100">{board.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {leaderboards[board.key].slice(0, 3).map((entry) => (
              <div key={entry.userId} className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/70 p-2">
                <span className="w-5 text-center text-xs font-bold text-amber-300">#{entry.rank}</span>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">{entry.avatar}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-100">{entry.username}</p>
                  <p className="text-[10px] text-zinc-400">{entry.label}</p>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-300">Top 3</Badge>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="mt-1 h-7 w-full text-[11px]"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthDialog({ type: "copy_picks", userId: leaderboards.roi[0]?.userId ?? "u2" });
                  return;
                }
                toast.success("Picks copied to your bracket");
              }}
            >
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copy bracket
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
