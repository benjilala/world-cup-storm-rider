"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { users } from "@/lib/mock/storm";
import { useLiveStore } from "@/store/liveStore";

export function WhosHereStrip() {
  const viewerCount = useLiveStore((s) => s.viewerCount);

  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/70 px-4 py-2">
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((u) => (
          <Avatar key={u.id} className="h-7 w-7 border border-zinc-800">
            <AvatarFallback className="text-[10px]">{u.avatar}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="text-xs font-medium text-zinc-300">
        {viewerCount.toLocaleString()} watching • {Math.round(viewerCount * 0.26).toLocaleString()} betting now
      </p>
    </div>
  );
}
