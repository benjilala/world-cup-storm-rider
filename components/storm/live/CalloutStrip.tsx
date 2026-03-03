"use client";

import { useMemo } from "react";
import { Bolt, Crown, ShieldAlert, Trophy } from "lucide-react";
import { useLiveStore } from "@/store/liveStore";

const TRACKED_TYPES = new Set(["lightning_awarded", "perfect_stage", "vault_decision", "stage_cleared"]);

function iconFor(type: string) {
  if (type === "lightning_awarded") return Bolt;
  if (type === "perfect_stage") return Crown;
  if (type === "vault_decision") return ShieldAlert;
  return Trophy;
}

export function CalloutStrip() {
  const activity = useLiveStore((s) => s.activityFeed);
  const callouts = useMemo(() => activity.filter((e) => TRACKED_TYPES.has(e.type)).slice(0, 3), [activity]);

  if (callouts.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-500/25 bg-zinc-900/70 p-3">
      <p className="mb-2 text-[11px] font-semibold tracking-widest text-amber-300">MOMENTS</p>
      <div className="space-y-1.5">
        {callouts.map((event) => {
          const Icon = iconFor(event.type);
          return (
            <div key={event.id} className="flex items-center gap-2 rounded-md bg-zinc-950/70 px-2.5 py-1.5 text-xs text-zinc-200">
              <Icon className="h-3.5 w-3.5 text-amber-300" />
              <span className="font-medium">{event.username}</span>
              <span className="text-zinc-400">{event.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
