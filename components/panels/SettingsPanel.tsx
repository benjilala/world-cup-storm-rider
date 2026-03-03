"use client";

import { TimelineScrubber } from "@/components/TimelineScrubber";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPanel() {
  return (
    <div className="space-y-3">
      <Card className="border-white/10 bg-black/35">
        <CardHeader className="py-3">
          <CardTitle className="text-[11px] font-semibold tracking-widest text-white/60">
            TIMELINE
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TimelineScrubber />
          <div className="mt-2 text-[11px] text-white/45">
            Drag into the past to scrub snapshots. Drag into the future to fast-forward.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

