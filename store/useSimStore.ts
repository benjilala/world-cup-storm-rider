import { create } from "zustand";
import { shallow } from "zustand/shallow";

import { SimEngine, getScenarioById, getScenarioSummaries } from "@/lib/sim/engine";
import type { BetEvent, ConsoleEvent, IntensityMode, MarketState, SimEvent } from "@/lib/sim/aggregator";
import type { CascadeState } from "@/lib/sim/cascade";

export type SimState = {
  engine: SimEngine | null;
  running: boolean;
  wasRunningBeforeScrub: boolean;

  currentScenario: string;
  intensityMode: IntensityMode;

  toggles: {
    showFlows: boolean;
    showRipples: boolean;
    highlightWhales: boolean;
  };

  // Simulation outputs
  events: BetEvent[];
  markets: Record<string, MarketState>;
  consoleEvents: ConsoleEvent[];
  cascades: Record<string, CascadeState>;

  // Scenario catalog
  eventCatalog: SimEvent[];
  selectedEventId: string | null;

  // Render clock
  nowMs: number;

  timeline: {
    pastWindowMs: number;
    futureWindowMs: number;
    sampleEveryMs: number;
    cursorOffsetMs: number; // negative=past, positive=future
    scrubbing: boolean;
    lastSampleAtMs: number;
    history: Array<{
      tsMs: number;
      events: BetEvent[];
      markets: Record<string, MarketState>;
      consoleEvents: ConsoleEvent[];
      cascades: Record<string, CascadeState>;
    }>;
  };
};

export type SimActions = {
  startSimulation: () => void;
  stopSimulation: () => void;
  setScenario: (scenarioId: string) => void;
  setIntensity: (mode: IntensityMode) => void;
  setToggles: (next: Partial<SimState["toggles"]>) => void;
  tick: (dtMs: number) => void;
  selectEvent: (eventId: string | null) => void;

  beginScrub: () => void;
  setTimelineOffsetMs: (offsetMs: number) => void;
  commitTimelineOffsetMs: (offsetMs: number) => void;
};

const defaultScenarioId = getScenarioSummaries()[0]?.id ?? "weekend-football";

export const useSimStore = create<SimState & SimActions>((set, get) => {
  const initialScenario = getScenarioById(defaultScenarioId);
  const engine = new SimEngine({ scenarioId: initialScenario.id });

  return {
    engine,
    running: true,
    wasRunningBeforeScrub: true,

    currentScenario: initialScenario.id,
    intensityMode: initialScenario.intensityMode ?? "NORMAL",

    toggles: { showFlows: true, showRipples: true, highlightWhales: true },

    events: [],
    markets: {},
    consoleEvents: [],
    cascades: {},

    eventCatalog: engine.events,
    selectedEventId: null,

    nowMs: Date.now(),

    timeline: {
      pastWindowMs: 10 * 60_000,
      futureWindowMs: 60_000,
      sampleEveryMs: 1000,
      cursorOffsetMs: 0,
      scrubbing: false,
      lastSampleAtMs: Date.now(),
      history: [],
    },

    startSimulation: () => set({ running: true }),
    stopSimulation: () => set({ running: false }),

    setScenario: (scenarioId) => {
      const def = getScenarioById(scenarioId);
      const nextEngine = new SimEngine({ scenarioId: def.id });
      const now = Date.now();
      set({
        engine: nextEngine,
        running: true,
        wasRunningBeforeScrub: true,
        currentScenario: def.id,
        intensityMode: def.intensityMode ?? "NORMAL",
        toggles: { showFlows: true, showRipples: true, highlightWhales: true },
        events: [],
        markets: {},
        consoleEvents: [],
        cascades: {},
        eventCatalog: nextEngine.events,
        selectedEventId: null,
        nowMs: now,
        timeline: {
          pastWindowMs: 10 * 60_000,
          futureWindowMs: 60_000,
          sampleEveryMs: 1000,
          cursorOffsetMs: 0,
          scrubbing: false,
          lastSampleAtMs: now,
          history: [],
        },
      });
    },

    setIntensity: (mode) => set({ intensityMode: mode }),

    setToggles: (next) =>
      set((s) => ({
        toggles: { ...s.toggles, ...next },
      })),

    tick: (dtMs) => {
      const { engine, running, intensityMode, timeline } = get();
      if (!engine || !running) return;

      const payload = engine.tick(dtMs, { intensityMode });
      if (!payload) return;

      const shouldSample = payload.nowMs - timeline.lastSampleAtMs >= timeline.sampleEveryMs;

      if (timeline.scrubbing && timeline.cursorOffsetMs < 0) {
        // While scrubbing the past, keep collecting history but don't overwrite the viewed state.
        if (shouldSample) {
          set((s) => ({
            timeline: {
              ...s.timeline,
              lastSampleAtMs: payload.nowMs,
              history: pushFrame(s.timeline, payload),
            },
            nowMs: payload.nowMs,
          }));
        } else {
          set({ nowMs: payload.nowMs });
        }
        return;
      }

      set((s) => {
        const nextHistory = shouldSample ? pushFrame(s.timeline, payload) : s.timeline.history;
        return {
          events: payload.events,
          markets: payload.markets,
          consoleEvents: payload.consoleEvents,
          cascades: payload.cascades,
          nowMs: payload.nowMs,
          timeline: {
            ...s.timeline,
            lastSampleAtMs: shouldSample ? payload.nowMs : s.timeline.lastSampleAtMs,
            history: nextHistory,
          },
        };
      });
    },

    selectEvent: (eventId) => set({ selectedEventId: eventId }),

    beginScrub: () => {
      const { running } = get();
      set({ wasRunningBeforeScrub: running, running: false, timeline: { ...get().timeline, scrubbing: true } });
    },

    setTimelineOffsetMs: (offsetMs) => {
      const { timeline, nowMs } = get();
      const past = -Math.abs(timeline.pastWindowMs);
      const future = Math.abs(timeline.futureWindowMs);
      const clamped = Math.max(past, Math.min(future, offsetMs));

      // Past view: load nearest frame.
      if (clamped < 0) {
        const target = nowMs + clamped;
        const frame = pickFrameAtOrBefore(timeline.history, target);
        if (frame) {
          set({
            events: frame.events,
            markets: frame.markets,
            consoleEvents: frame.consoleEvents,
            cascades: frame.cascades,
            timeline: { ...timeline, cursorOffsetMs: clamped, scrubbing: true },
          });
          return;
        }
      }

      set({ timeline: { ...timeline, cursorOffsetMs: clamped, scrubbing: true } });
    },

    commitTimelineOffsetMs: (offsetMs) => {
      const { engine, intensityMode, wasRunningBeforeScrub, timeline, nowMs } = get();
      if (!engine) return;

      const past = -Math.abs(timeline.pastWindowMs);
      const future = Math.abs(timeline.futureWindowMs);
      const clamped = Math.max(past, Math.min(future, offsetMs));

      // Future: fast-forward the engine, then return to live.
      if (clamped > 0) {
        const advanceMs = clamped;
        fastForward(engine, advanceMs, intensityMode);
        set((s) => ({
          running: wasRunningBeforeScrub,
          timeline: { ...s.timeline, cursorOffsetMs: 0, scrubbing: false },
        }));
        return;
      }

      // Present: resume live updates.
      if (Math.abs(clamped) < 1) {
        set((s) => ({
          running: s.wasRunningBeforeScrub,
          timeline: { ...s.timeline, cursorOffsetMs: 0, scrubbing: false },
        }));
        return;
      }

      // Past: remain paused; keep cursor.
      set({ timeline: { ...timeline, cursorOffsetMs: clamped, scrubbing: true }, nowMs });
    },
  };
});

export const useSimSelector = shallow;

function pushFrame(
  timeline: SimState["timeline"],
  payload: { nowMs: number; events: BetEvent[]; markets: Record<string, MarketState>; consoleEvents: ConsoleEvent[]; cascades: Record<string, CascadeState> },
) {
  const maxFrames = Math.ceil(timeline.pastWindowMs / timeline.sampleEveryMs) + 30;
  const next = timeline.history.concat({
    tsMs: payload.nowMs,
    events: payload.events.slice(-520),
    markets: payload.markets,
    consoleEvents: payload.consoleEvents.slice(-220),
    cascades: payload.cascades,
  });
  if (next.length <= maxFrames) return next;
  return next.slice(next.length - maxFrames);
}

function pickFrameAtOrBefore(
  history: SimState["timeline"]["history"],
  targetTs: number,
) {
  for (let i = history.length - 1; i >= 0; i--) {
    const f = history[i]!;
    if (f.tsMs <= targetTs) return f;
  }
  return history[0] ?? null;
}

function fastForward(engine: SimEngine, advanceMs: number, intensityMode: IntensityMode) {
  let remaining = Math.max(0, advanceMs);
  const step = 250; // larger steps for fast-forward
  let guard = 0;
  while (remaining > 0 && guard < 10_000) {
    const dt = Math.min(step, remaining);
    engine.tick(dt, { intensityMode });
    remaining -= dt;
    guard += 1;
  }
}

