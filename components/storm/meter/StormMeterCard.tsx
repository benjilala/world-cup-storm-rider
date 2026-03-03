"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp } from "lucide-react";
import { LightningMeter } from "./LightningMeter";
import type { StormRun } from "@/lib/types/storm";
import { STAGE_LABELS } from "@/config/storm";

export function StormMeterCard({ run }: { run: StormRun }) {
  const progress = run.stageResults.length;
  const total = 6;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Storm Progress</CardTitle>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3 text-storm-lightning" />
          {STAGE_LABELS[run.currentStage]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <LightningMeter progress={progress} total={total} />

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold font-mono">${run.currentValue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Current Value</p>
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-storm-vault">${run.vaultBalance.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Vault</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-storm-perfect" />
              <p className="text-lg font-bold font-mono">
                {((run.currentValue / run.startingStake) * 100 - 100).toFixed(0)}%
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground">ROI</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
