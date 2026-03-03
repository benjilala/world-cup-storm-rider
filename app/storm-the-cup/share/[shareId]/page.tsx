"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, UserPlus, ArrowRight, Share2, Zap, Trophy, Shield } from "lucide-react";
import Link from "next/link";

export default function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = use(params);

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Visual share card */}
        <div className="relative overflow-hidden rounded-2xl border border-storm-gold/30 bg-gradient-to-br from-storm-surface via-card to-storm-gold/5 p-6">
          <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-storm-gold/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-storm-accent/5 blur-3xl" />

          <div className="relative z-10 text-center space-y-4">
            <Badge variant="outline" className="gap-1 border-storm-gold/30 text-storm-gold">
              <Share2 className="h-3 w-3" />
              Shared Bracket
            </Badge>

            <div className="flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-storm-gold/10 border border-storm-gold/20">
                <Trophy className="h-7 w-7 text-storm-gold" />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold">Storm the Cup Bracket</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Someone shared their prediction picks with you
              </p>
            </div>

            {/* Mock bracket preview */}
            <div className="flex items-center justify-center gap-8 text-[10px] text-muted-foreground py-3">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-foreground">12</p>
                <p>Picks made</p>
              </div>
              <div className="h-8 w-px bg-border/30" />
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-storm-gold flex items-center justify-center gap-1">
                  <Zap className="h-4 w-4" />3
                </p>
                <p>Lightning</p>
              </div>
              <div className="h-8 w-px bg-border/30" />
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-storm-vault flex items-center justify-center gap-1">
                  <Shield className="h-4 w-4" />$2.4k
                </p>
                <p>Vaulted</p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground/50 font-mono">
              #{shareId}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full gap-2 bg-storm-accent hover:bg-storm-accent/90 h-10">
            <Copy className="h-4 w-4" />
            Copy Picks to Your Bracket
          </Button>
          <Button variant="outline" className="w-full gap-2 h-10">
            <UserPlus className="h-4 w-4" />
            Follow This User
          </Button>
          <Button variant="ghost" className="w-full gap-2 h-10" asChild>
            <Link href="/storm-the-cup">
              Open Storm the Cup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
