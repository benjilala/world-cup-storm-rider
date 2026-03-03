"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  Flame,
  LayoutDashboard,
  List,
  Settings,
  TrendingUp,
} from "lucide-react";

import { PanelSheet } from "@/components/PanelSheet";
import { ConsensusPanel } from "@/components/panels/ConsensusPanel";
import { HotEventsPanel } from "@/components/panels/HotEventsPanel";
import { LineMovesPanel } from "@/components/panels/LineMovesPanel";
import { LiveTapePanel } from "@/components/panels/LiveTapePanel";
import { OverviewPanel } from "@/components/panels/OverviewPanel";
import { SettingsPanel } from "@/components/panels/SettingsPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getScenarioSummaries } from "@/lib/sim/engine";
import type { IntensityMode } from "@/lib/sim/aggregator";
import { useSimStore } from "@/store/useSimStore";

type PanelId = "overview" | "hot" | "consensus" | "lines" | "tape" | "settings";

const intensityModes: IntensityMode[] = ["CALM", "NORMAL", "CHAOS"];

function intensityToSlider(mode: IntensityMode) {
  return intensityModes.indexOf(mode);
}

function sliderToIntensity(v: number): IntensityMode {
  return intensityModes[Math.max(0, Math.min(intensityModes.length - 1, Math.round(v)))] ?? "NORMAL";
}

export function AppSidebar() {
  const running = useSimStore((s) => s.running);
  const startSimulation = useSimStore((s) => s.startSimulation);
  const stopSimulation = useSimStore((s) => s.stopSimulation);

  const currentScenario = useSimStore((s) => s.currentScenario);
  const setScenario = useSimStore((s) => s.setScenario);

  const intensityMode = useSimStore((s) => s.intensityMode);
  const setIntensity = useSimStore((s) => s.setIntensity);

  const toggles = useSimStore((s) => s.toggles);
  const setToggles = useSimStore((s) => s.setToggles);

  const [panel, setPanel] = useState<PanelId | null>(null);

  const scenarioOptions = useMemo(() => getScenarioSummaries(), []);

  const items = useMemo(
    () =>
      [
        { id: "overview" as const, label: "OVERVIEW", icon: LayoutDashboard },
        { id: "hot" as const, label: "HOT EVENTS", icon: Flame },
        { id: "consensus" as const, label: "CONSENSUS", icon: TrendingUp },
        { id: "lines" as const, label: "LINE MOVES", icon: Activity },
        { id: "tape" as const, label: "LIVE TAPE", icon: List },
        { id: "settings" as const, label: "SETTINGS", icon: Settings },
      ] as const,
    [],
  );

  const title =
    panel === "overview"
      ? "OVERVIEW"
      : panel === "hot"
        ? "HOT EVENTS"
        : panel === "consensus"
          ? "CONSENSUS"
          : panel === "lines"
            ? "LINE MOVES"
            : panel === "tape"
              ? "LIVE TAPE"
              : panel === "settings"
                ? "SETTINGS"
                : "";

  return (
    <>
      <Sidebar variant="sidebar" collapsible="offcanvas" className="border-r border-white/10 bg-black/55">
        <SidebarHeader className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold tracking-widest text-white/80">
                PREDICTION GENESIS
              </div>
              <div className="truncate text-[10px] text-white/45">
                Global consensus simulator
              </div>
            </div>
            <SidebarTrigger />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="uppercase tracking-wide">
              Simulation
            </Badge>
            <Button
              type="button"
              variant={running ? "secondary" : "default"}
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={running ? stopSimulation : startSimulation}
            >
              {running ? "PAUSE" : "START"}
            </Button>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] tracking-widest text-white/50">
              NAVIGATION
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((it) => (
                  <SidebarMenuItem key={it.id}>
                    <SidebarMenuButton
                      onClick={() => setPanel(it.id)}
                      isActive={panel === it.id}
                      className="data-[active=true]:border data-[active=true]:border-white/15 data-[active=true]:bg-white/5"
                    >
                      <it.icon className="h-4 w-4" />
                      <span className="text-[11px] font-semibold tracking-widest">
                        {it.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] tracking-widest text-white/50">
              SIM CONTROLS
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-3 px-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold tracking-widest text-white/55">
                    SCENARIO
                  </div>
                  <span className="text-[10px] text-white/40">seeded</span>
                </div>
                <Select value={currentScenario} onValueChange={setScenario}>
                  <SelectTrigger className="h-9 border-white/10 bg-black/30 text-[12px]">
                    <SelectValue placeholder="Scenario" />
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
                  <div className="text-[10px] font-semibold tracking-widest text-white/55">
                    INTENSITY
                  </div>
                  <div className="font-mono text-[10px] text-white/45">
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
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-2">
                <div className="text-[10px] font-semibold tracking-widest text-white/55">
                  VISUALS
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] text-white/75">Base pulses</div>
                  <Switch checked={toggles.showFlows} onCheckedChange={(v) => setToggles({ showFlows: v })} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] text-white/75">Country outlines</div>
                  <Switch checked={toggles.showRipples} onCheckedChange={(v) => setToggles({ showRipples: v })} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] text-white/75">Whale/alert tint</div>
                  <Switch checked={toggles.highlightWhales} onCheckedChange={(v) => setToggles({ highlightWhales: v })} />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2">
          <div className={cn("rounded-md border border-white/10 bg-black/25 px-3 py-2 text-[10px] text-white/55")}>
            SIMULATION — NOT REAL WAGER DATA
          </div>
        </SidebarFooter>
      </Sidebar>

      <PanelSheet open={panel !== null} onOpenChange={(o) => setPanel(o ? panel : null)} title={title}>
        {panel === "overview" ? <OverviewPanel /> : null}
        {panel === "hot" ? <HotEventsPanel /> : null}
        {panel === "consensus" ? <ConsensusPanel /> : null}
        {panel === "lines" ? <LineMovesPanel /> : null}
        {panel === "tape" ? <LiveTapePanel /> : null}
        {panel === "settings" ? <SettingsPanel /> : null}
      </PanelSheet>
    </>
  );
}

