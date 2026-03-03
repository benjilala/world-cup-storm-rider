"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { leaderboards } from "@/lib/mock/storm";

const TAB_CONFIG = [
  { key: "roi", label: "ROI" },
  { key: "streak", label: "Best Streak" },
  { key: "mostCopied", label: "Most Copied" },
] as const;

export function LeaderboardsTabs() {
  return (
    <Tabs defaultValue="roi" className="w-full">
      <TabsList className="w-full">
        {TAB_CONFIG.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} className="flex-1 text-xs">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TAB_CONFIG.map((tab) => (
        <TabsContent key={tab.key} value={tab.key} className="mt-3">
          <div className="space-y-2">
            {(leaderboards[tab.key] ?? []).map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className={`text-sm font-bold w-6 text-center ${
                  entry.rank === 1 ? "text-storm-lightning" : entry.rank === 2 ? "text-muted-foreground" : "text-storm-ride"
                }`}>
                  #{entry.rank}
                </span>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px]">{entry.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.username}</p>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {entry.label}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
