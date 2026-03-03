"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, UserPlus } from "lucide-react";
import { experts } from "@/lib/mock/storm";
import { AuthGate } from "@/components/auth/AuthGate";
import { useSocialStore } from "@/store/socialStore";

export function ExpertCarousel() {
  const { followUser, isFollowing } = useSocialStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-storm-lightning" />
        <h3 className="text-sm font-medium">Top Experts</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {experts.map((expert) => (
          <Card key={expert.userId} className="min-w-[200px] shrink-0">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">{expert.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{expert.username}</p>
                  <p className="text-[10px] text-muted-foreground">{expert.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Win Rate</p>
                  <p className="font-mono font-medium">{(expert.winRate * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ROI</p>
                  <p className="font-mono font-medium text-storm-perfect flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    {(expert.roi * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {expert.followers.toLocaleString()} followers
                </Badge>
                <AuthGate intent={{ type: "follow_user", userId: expert.userId }}>
                  <Button
                    variant={isFollowing(expert.userId) ? "outline" : "default"}
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => followUser(expert.userId)}
                  >
                    <UserPlus className="h-3 w-3" />
                    Follow
                  </Button>
                </AuthGate>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
