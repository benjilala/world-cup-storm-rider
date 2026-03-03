"use client";

import { Zap, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

interface JoinStormCardProps {
  variant?: "default" | "compact";
}

export function JoinStormCard({ variant = "default" }: JoinStormCardProps) {
  const { isAuthenticated, openAuthDialog } = useAuthStore();

  if (isAuthenticated) return null;

  if (variant === "compact") {
    return (
      <button
        onClick={() => openAuthDialog()}
        className="flex w-full items-center gap-3 rounded-lg border border-storm-accent/20 bg-storm-muted/30 p-3 text-left transition-colors hover:bg-storm-accent/10"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-storm-accent/10">
          <Zap className="h-4 w-4 text-storm-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">Join the Storm</p>
          <p className="text-[11px] text-muted-foreground truncate">
            Sign up to start wagering
          </p>
        </div>
      </button>
    );
  }

  return (
    <Card className="border-storm-accent/20 bg-gradient-to-b from-storm-muted/40 to-transparent overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 p-5 text-center">
        <div className="rounded-full bg-storm-accent/10 p-3">
          <Zap className="h-6 w-6 text-storm-accent" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">Join the Storm</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create an account to place bets, start Storm Runs, and compete with
            the community.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3" /> Bracket
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" /> Storm Runs
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Social
          </span>
        </div>

        <Button
          size="sm"
          className="w-full gap-1.5"
          onClick={() => openAuthDialog()}
        >
          <Zap className="h-3.5 w-3.5" />
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
