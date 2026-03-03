"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, UserMinus, Copy, Share2 } from "lucide-react";
import { useSocialStore } from "@/store/socialStore";
import { AuthGate } from "@/components/auth/AuthGate";

interface ProfileHeaderProps {
  userId: string;
  username: string;
  avatar: string;
  runCount: number;
  followers: number;
  following: number;
}

export function ProfileHeader({ userId, username, avatar, runCount, followers, following }: ProfileHeaderProps) {
  const { isFollowing, followUser, unfollowUser } = useSocialStore();
  const followed = isFollowing(userId);

  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-6">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{avatar}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold">{username}</h2>
          <div className="flex gap-4 mt-1 justify-center sm:justify-start text-sm text-muted-foreground">
            <span><strong className="text-foreground">{runCount}</strong> runs</span>
            <span><strong className="text-foreground">{followers}</strong> followers</span>
            <span><strong className="text-foreground">{following}</strong> following</span>
          </div>
        </div>

        <div className="flex gap-2">
          <AuthGate
            intent={{ type: "follow_user", userId }}
            fallbackLabel="Sign in to follow"
          >
            <Button
              variant={followed ? "outline" : "default"}
              size="sm"
              className="gap-1.5"
              onClick={() => followed ? unfollowUser(userId) : followUser(userId)}
            >
              {followed ? <UserMinus className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              {followed ? "Unfollow" : "Follow"}
            </Button>
          </AuthGate>
          <AuthGate
            intent={{ type: "copy_picks", userId }}
            fallbackLabel="Sign in to copy"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </AuthGate>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
