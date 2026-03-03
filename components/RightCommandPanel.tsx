"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getScenarioSummaries } from "@/lib/sim/engine";
import type { IntensityMode } from "@/lib/sim/aggregator";
import { useSimStore } from "@/store/useSimStore";

const intensityModes: IntensityMode[] = ["CALM", "NORMAL", "CHAOS"];

function intensityToSlider(mode: IntensityMode) {
  return intensityModes.indexOf(mode);
}

function sliderToIntensity(v: number): IntensityMode {
  return intensityModes[Math.max(0, Math.min(intensityModes.length - 1, Math.round(v)))] ?? "NORMAL";
}

export function RightCommandPanel() {
  const running = useSimStore((s) => s.running);
  const startSimulation = useSimStore((s) => s.startSimulation);
  const stopSimulation = useSimStore((s) => s.stopSimulation);

  const currentScenario = useSimStore((s) => s.currentScenario);
  const setScenario = useSimStore((s) => s.setScenario);

  const intensityMode = useSimStore((s) => s.intensityMode);
  const setIntensity = useSimStore((s) => s.setIntensity);

  const toggles = useSimStore((s) => s.toggles);
  const setToggles = useSimStore((s) => s.setToggles);

  const scenarioOptions = useMemo(() => getScenarioSummaries(), []);

  return (
    <Card className="h-full border-white/10 bg-black/40 backdrop-blur">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-[11px] font-semibold tracking-widest text-white/80">
            COMMAND PANEL
          </CardTitle>
          <Badge variant="secondary" className="uppercase tracking-wide">
            Norse Sim
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-white/75">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold tracking-widest text-white/60">
            SIM
          </div>
          <Button
            variant={running ? "secondary" : "default"}
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={running ? stopSimulation : startSimulation}
          >
            {running ? "PAUSE" : "START"}
          </Button>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold tracking-widest text-white/60">
              SCENARIO
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default text-[11px] text-white/45">
                  seeded
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px] text-xs">
                Synthetic, deterministic simulation. Not real wagers.
              </TooltipContent>
            </Tooltip>
          </div>
          <Select value={currentScenario} onValueChange={(v) => setScenario(v)}>
            <SelectTrigger className="h-9 border-white/10 bg-black/30">
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-black/90 text-white">
              {scenarioOptions.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold tracking-widest text-white/60">
              INTENSITY
            </div>
            <div className="font-mono text-[11px] tabular-nums text-white/50">
              {intensityMode}
            </div>
          </div>
          <Slider
            value={[intensityToSlider(intensityMode)]}
            min={0}
            max={2}
            step={1}
            onValueChange={(v) => setIntensity(sliderToIntensity(v[0] ?? 1))}
          />
          <div className="text-[11px] text-white/45">
            Controls synthetic bet volume, spikes, and whale frequency.
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div className="space-y-2">
          <div className="text-[11px] font-semibold tracking-widest text-white/60">
            TOGGLES
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] text-white/75">Show flows</div>
            <Switch checked={toggles.showFlows} onCheckedChange={(v) => setToggles({ showFlows: v })} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] text-white/75">Show ripples</div>
            <Switch checked={toggles.showRipples} onCheckedChange={(v) => setToggles({ showRipples: v })} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] text-white/75">Highlight whales</div>
            <Switch checked={toggles.highlightWhales} onCheckedChange={(v) => setToggles({ highlightWhales: v })} />
          </div>
        </div>

        <Separator className="bg-white/10" />

        <div
          className={cn(
            "rounded-lg border border-white/10 bg-black/20 p-3 text-[11px]",
          )}
        >
          <div className="text-[11px] font-semibold tracking-widest text-white/60">
            DISCLAIMER
          </div>
          <div className="mt-1 text-white/55">
            SIMULATION ONLY — no real wager data. Not a sportsbook.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

