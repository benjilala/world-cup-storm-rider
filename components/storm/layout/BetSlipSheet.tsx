"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBetSlipStore } from "@/store/betSlipStore";
import { useAuthStore } from "@/store/authStore";
import { Trash2, ReceiptText } from "lucide-react";

export function BetSlipSheet() {
  const {
    isOpen,
    closeSlip,
    selections,
    mode,
    toggleMode,
    removeSelection,
    setStake,
    clearSlip,
    totalStake,
    potentialPayout,
  } = useBetSlipStore();
  const { isAuthenticated, openAuthDialog } = useAuthStore();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSlip()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5" />
            Bet Slip
            {selections.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {selections.length}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {selections.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            <p>No selections yet. Add picks from matches.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-1">
              <Button
                variant={mode === "single" ? "default" : "outline"}
                size="sm"
                onClick={() => mode !== "single" && toggleMode()}
              >
                Singles
              </Button>
              <Button
                variant={mode === "multi" ? "default" : "outline"}
                size="sm"
                onClick={() => mode !== "multi" && toggleMode()}
              >
                Multi
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive"
                onClick={clearSlip}
              >
                Clear all
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3 p-1">
                {selections.map((sel) => (
                  <div
                    key={sel.id}
                    className="rounded-lg border bg-card p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{sel.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Odds: {sel.odds.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeSelection(sel.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Input
                      type="number"
                      value={sel.stake}
                      onChange={(e) => setStake(sel.id, Number(e.target.value))}
                      className="h-8 font-mono text-sm"
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground">
                      Payout: ${(sel.stake * sel.odds).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-3 p-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Stake</span>
                <span className="font-mono font-medium">${totalStake().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Payout</span>
                <span className="font-mono font-medium text-storm-perfect">
                  ${potentialPayout().toFixed(2)}
                </span>
              </div>

              {isAuthenticated ? (
                <Button className="w-full" size="lg">
                  Place Bet
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => openAuthDialog()}
                >
                  Sign in to Place Bet
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
