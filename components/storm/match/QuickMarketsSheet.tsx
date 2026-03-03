"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus } from "lucide-react";
import type { Market } from "@/lib/types/storm";
import { useBetSlipStore } from "@/store/betSlipStore";
import { AuthGate } from "@/components/auth/AuthGate";

export function QuickMarketsSheet({ markets, matchId }: { markets: Market[]; matchId: string }) {
  const { addSelection } = useBetSlipStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          Markets ({markets.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Quick Markets</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {markets.map((market) => (
            <div key={market.id} className="space-y-2">
              <p className="text-sm font-medium">{market.label}</p>
              <div className="grid gap-1.5">
                {market.selections.map((sel) => (
                  <AuthGate
                    key={sel.id}
                    intent={{ type: "add_to_slip", selectionId: sel.id, marketId: market.id }}
                    fallbackLabel="Sign in to bet"
                  >
                    <button
                      className="flex items-center justify-between rounded-md border p-2.5 text-xs hover:border-storm-accent/40 transition-colors w-full text-left"
                      onClick={() =>
                        addSelection({
                          id: sel.id,
                          marketId: market.id,
                          matchId,
                          label: `${market.label} — ${sel.label}`,
                          odds: sel.odds,
                        })
                      }
                    >
                      <span>{sel.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={sel.movement === "up" ? "default" : sel.movement === "down" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {sel.odds.toFixed(2)}
                        </Badge>
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </button>
                  </AuthGate>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
