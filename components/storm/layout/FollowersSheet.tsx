"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSocialStore } from "@/store/socialStore";
import { users } from "@/lib/mock/storm";
import { UserMinus, UserPlus } from "lucide-react";

export function FollowersSheet() {
  const { followersSheetOpen, setFollowersOpen, following, followUser, unfollowUser } =
    useSocialStore();

  return (
    <Sheet open={followersSheetOpen} onOpenChange={setFollowersOpen}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Following & Followers</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-2">
            {users.map((u) => {
              const isFollowed = following.has(u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{u.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Balance: ${u.balance.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant={isFollowed ? "outline" : "default"}
                    size="sm"
                    className="gap-1"
                    onClick={() =>
                      isFollowed ? unfollowUser(u.id) : followUser(u.id)
                    }
                  >
                    {isFollowed ? (
                      <>
                        <UserMinus className="h-3 w-3" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
