"use client";

import { useState } from "react";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { AddFundsDrawer } from "./AddFundsDrawer";

export function BalanceBadge() {
  const { session, isAuthenticated } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isAuthenticated || !session) return null;

  const balance = session.user.balance;
  const isLow = balance < 50;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`gap-1.5 font-mono text-sm transition-colors ${
              isLow
                ? "border-storm-ride/40 text-storm-ride hover:border-storm-ride/60"
                : ""
            }`}
            onClick={() => setDrawerOpen(true)}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>${balance.toLocaleString()}</span>
            <Plus className="h-3 w-3 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {isLow ? "Balance is low — tap to add funds" : "Add funds"}
        </TooltipContent>
      </Tooltip>

      <AddFundsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
