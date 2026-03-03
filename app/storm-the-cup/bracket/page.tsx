"use client";

import { useState } from "react";
import { Trophy, Zap, Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnockoutBracket } from "@/components/storm/bracket/KnockoutBracket";
import { GroupGrid } from "@/components/storm/bracket/GroupGrid";
import { useBracketStore } from "@/store/bracketStore";
import { useUIStore } from "@/store/uiStore";
import { groups } from "@/lib/mock/storm";

export default function BracketPage() {
  const { knockoutPicks, groupPicks } = useBracketStore();
  const { bracketViewMode, toggleBracketViewMode } = useUIStore();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const knockoutCount = Object.keys(knockoutPicks).length;
  const groupCount = Object.values(groupPicks).reduce((sum, arr) => sum + arr.length, 0);
  const totalPicks = knockoutCount + groupCount;
  const totalSlots = 15 + groups.length * 2;

  const isFull = bracketViewMode === "full";

  return (
    <div
      className={
        isFull
          ? "fixed inset-0 z-50 flex flex-col bg-background"
          : "p-4 sm:p-6 space-y-5"
      }
    >
      {/* Header */}
      <div
        className={
          "flex items-center justify-between shrink-0 " +
          (isFull ? "px-4 py-3 border-b border-border/30 bg-background/80 backdrop-blur-lg" : "")
        }
      >
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-storm-gold" />
          <div>
            <h1 className="text-xl font-bold tracking-wide sm:text-2xl">BRACKET</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Build your path to the final
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-mono font-bold">{totalPicks}/{totalSlots}</p>
            <p className="text-[9px] text-muted-foreground">picks made</p>
          </div>
          <div className="h-9 w-9 rounded-full border-2 border-storm-accent/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-storm-accent">
              {totalSlots > 0 ? Math.round((totalPicks / totalSlots) * 100) : 0}%
            </span>
          </div>
          {totalPicks === totalSlots && (
            <Badge className="bg-storm-perfect/20 text-storm-perfect text-[10px] gap-1">
              <Zap className="h-3 w-3" />
              LOCKED IN
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={toggleBracketViewMode}
            title={isFull ? "Exit full screen" : "Full screen bracket"}
          >
            {isFull ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="knockout" className={isFull ? "flex-1 flex flex-col overflow-hidden px-4 pb-4" : ""}>
        <TabsList className="bg-storm-surface h-9 shrink-0">
          <TabsTrigger value="knockout" className="text-xs gap-1">
            <Trophy className="h-3 w-3" />
            Knockout
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-xs">
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="knockout"
          className={isFull ? "mt-3 flex-1 overflow-auto" : "mt-4"}
        >
          <KnockoutBracket zoomToFit={isFull} />
        </TabsContent>

        <TabsContent
          value="groups"
          className={isFull ? "mt-3 flex-1 overflow-auto" : "mt-4"}
        >
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[640px] sm:min-w-0">
              <GroupGrid
                groups={groups}
                liveMode
                selectedGroupId={selectedGroupId}
                onSelectGroup={setSelectedGroupId}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
