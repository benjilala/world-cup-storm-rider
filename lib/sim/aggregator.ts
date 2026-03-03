import { applyDecay, clamp01 } from "./decay";
import { RingHistory } from "./history";
import { updateLineOnBet, type BetKind, type BetSide, type LineBehavior } from "./line";
import { computeSwingSignals } from "./swing";
import {
  cascadeIsActive,
  cascadeStep,
  makeCascadeState,
  maybeTriggerCascade,
  type CascadeBehavior,
  type CascadeTrigger,
  type CascadeState,
} from "./cascade";

export type IntensityMode = "CALM" | "NORMAL" | "CHAOS";

export type SimEvent = {
  id: string;
  sport: string;
  league: string;
  eventName: string;
  eventLat: number;
  eventLng: number;
  country: string;
  popularity: number; // 0..1
  favoriteSide: BetSide;
  startTimeMs: number;
};

export type BetEvent = {
  id: string;
  tsMs: number;
  eventId: string;
  country: string;
  channel: string;
  origin: { lat: number; lng: number };
  sport: string;
  league: string;
  eventName: string;
  side: BetSide;
  stake: number;
  kind: BetKind;
};

export type ConsoleEventType =
  | "WHALE_HIT"
  | "SWING"
  | "BIG_SWING"
  | "CONSENSUS_FLIP"
  | "LINE_UP"
  | "LINE_DOWN"
  | "LINE_MOVE"
  | "WHALE"
  | "CASCADE_START"
  | "COPY_WAVE";

export type ConsoleEvent = {
  id: string;
  tsMs: number;
  type: ConsoleEventType;
  eventId: string;
  sport: string;
  league: string;
  eventName: string;
  message: string;
  side?: BetSide;
  delta?: number;
  line?: number;
  stake?: number;
  country?: string;
};

export interface MarketState {
  eventId: string;
  sport: string;
  league: string;
  eventName: string;
  eventLat: number;
  eventLng: number;

  totalHandle5m: number;
  bets5m: number;

  sideAHandle5m: number;
  sideBHandle5m: number;

  sideAPct: number;
  sideBPct: number;
  betsPerMin: number;
  heatScore: number;

  sideAPct_60sAgo: number;
  swing60s: number;
  lastSwingTs: number;
  lastFlipTs: number;

  line: number; // PRICE INDEX: 0.20 – 0.80
  lineMove60s: number;
  lastLineTs: number;
}

export type BehaviorPack = {
  stake: {
    logNormalMu: number;
    logNormalSigma: number;
    min: number;
    max: number;
    spikeMultiplier: number;
    sharpMultiplier: number;
    whaleMultiplier: number;
    spikeMax: number;
    sharpMax: number;
    whaleMin: number;
    whaleMax: number;
  };
  rates: {
    baseBetsPerSecond: number;
    sharpInjectionRate: number;
    spikeChance: number;
    whaleChance: number;
  };
  timing: {
    nearStartSigmaMinutes: number;
    nearStartSpikeAmplitude: number;
  };
  decay: {
    window5mHalfLifeMs: number;
    window60sHalfLifeMs: number;
  };
  line: LineBehavior;
  cascade: CascadeBehavior;
  intensityModes: Record<IntensityMode, { betRate: number; whale: number; sharp: number; noise: number; cascade: number }>;
};

type MarketInternal = {
  state: MarketState;
  lastDecayAtMs: number;
  lastHistoryAtMs: number;
  history: RingHistory;
};

export class MarketAggregator {
  private readonly markets = new Map<string, MarketInternal>();
  private readonly cascades = new Map<string, CascadeState>();
  private consoleSeq = 0;

  private readonly historyEveryMs = 500;

  constructor(
    private readonly eventsById: Record<string, SimEvent>,
    private readonly behavior: BehaviorPack,
    nowMs: number,
    private readonly rand: () => number,
  ) {
    for (const ev of Object.values(eventsById)) {
      const initLine = 0.5 + (this.rand() - 0.5) * 0.06;
      const initPct = 0.5 + (this.rand() - 0.5) * 0.06;
      const s: MarketState = {
        eventId: ev.id,
        sport: ev.sport,
        league: ev.league,
        eventName: ev.eventName,
        eventLat: ev.eventLat,
        eventLng: ev.eventLng,

        totalHandle5m: 0,
        bets5m: 0,
        sideAHandle5m: 0,
        sideBHandle5m: 0,
        sideAPct: initPct,
        sideBPct: 1 - initPct,
        betsPerMin: 0,
        heatScore: 0,

        sideAPct_60sAgo: initPct,
        swing60s: 0,
        lastSwingTs: 0,
        lastFlipTs: 0,

        line: clamp01(initLine) * 0.6 + 0.2, // keep inside ~0.2..0.8
        lineMove60s: 0,
        lastLineTs: 0,
      };

      const mi: MarketInternal = {
        state: s,
        lastDecayAtMs: nowMs,
        lastHistoryAtMs: nowMs,
        history: new RingHistory(200),
      };

      mi.history.push({ ts: nowMs, sideAPct: s.sideAPct, line: s.line });
      this.markets.set(ev.id, mi);
      this.cascades.set(ev.id, makeCascadeState(ev.id));
    }
  }

  snapshot() {
    const out: Record<string, MarketState> = {};
    for (const [id, m] of this.markets.entries()) out[id] = m.state;
    return out;
  }

  getMarketState(eventId: string): MarketState | null {
    return this.markets.get(eventId)?.state ?? null;
  }

  cascadeSnapshot() {
    const out: Record<string, CascadeState> = {};
    for (const [id, c] of this.cascades.entries()) out[id] = c;
    return out;
  }

  getCascade(eventId: string) {
    return this.cascades.get(eventId) ?? null;
  }

  isCascadeActive(eventId: string, nowMs: number) {
    const c = this.cascades.get(eventId);
    return c ? cascadeIsActive(c, nowMs) : false;
  }

  /**
   * Advance decayed rolling windows for all markets.
   */
  advanceTo(nowMs: number) {
    for (const m of this.markets.values()) {
      const dt = nowMs - m.lastDecayAtMs;
      if (dt <= 0) continue;

      const halfLife = this.behavior.decay.window5mHalfLifeMs;
      m.state.totalHandle5m = applyDecay(m.state.totalHandle5m, dt, halfLife);
      m.state.bets5m = applyDecay(m.state.bets5m, dt, halfLife);
      m.state.sideAHandle5m = applyDecay(m.state.sideAHandle5m, dt, halfLife);
      m.state.sideBHandle5m = applyDecay(m.state.sideBHandle5m, dt, halfLife);

      m.lastDecayAtMs = nowMs;

      // Maintain consensus history at a fixed cadence (keeps memory bounded and supports 60s lookbacks).
      if (nowMs - m.lastHistoryAtMs >= this.historyEveryMs) {
        m.history.push({
          ts: nowMs,
          sideAPct: m.state.sideAPct,
          line: m.state.line,
        });
        m.lastHistoryAtMs = nowMs;
      }
    }

    // Step cascades at a low-cost cadence (decay effects).
    for (const [id, c] of this.cascades.entries()) {
      const next = cascadeStep(c, nowMs, this.behavior.cascade);
      this.cascades.set(id, next);
    }
  }

  /**
   * Apply a single bet into the market state, returning emitted console events.
   */
  applyBet(bet: BetEvent, intensityMode: IntensityMode): ConsoleEvent[] {
    const m = this.markets.get(bet.eventId);
    if (!m) return [];

    const out: ConsoleEvent[] = [];
    const s = m.state;
    const prevSideAPct = s.sideAPct;

    // Update rolling 5m window accumulators (already decayed by advanceTo()).
    s.bets5m += 1;
    if (bet.side === "A") s.sideAHandle5m += bet.stake;
    else s.sideBHandle5m += bet.stake;
    s.totalHandle5m = s.sideAHandle5m + s.sideBHandle5m;

    const total = s.totalHandle5m;
    s.sideAPct = total > 0 ? s.sideAHandle5m / total : s.sideAPct;
    s.sideBPct = 1 - s.sideAPct;

    // Approximate bets/min from a decayed 5m window.
    s.betsPerMin = s.bets5m / 5;

    // Heat score: log handle + bpm blend.
    const handleScore = clamp01(Math.log10(1 + s.totalHandle5m) / 6.2);
    const bpmScore = clamp01(s.betsPerMin / 140);
    s.heatScore = clamp01(0.55 * handleScore + 0.45 * bpmScore);

    // Update line per bet.
    const intensity = this.behavior.intensityModes[intensityMode] ?? this.behavior.intensityModes.NORMAL;
    s.line = updateLineOnBet({
      rand: this.rand,
      line: s.line,
      sideAPct: s.sideAPct,
      side: bet.side,
      stake: bet.stake,
      kind: bet.kind,
      totalHandle5m: s.totalHandle5m,
      behavior: this.behavior.line,
      noiseMult: intensity.noise,
    });

    const nowMs = bet.tsMs;

    // 60s lookbacks.
    const p60 = m.history.atOrBefore(nowMs - 60_000);
    s.sideAPct_60sAgo = p60?.sideAPct ?? s.sideAPct;
    const line60 = p60?.line ?? s.line;
    s.lineMove60s = s.line - line60;

    const swing = computeSwingSignals({
      nowMs,
      sideAPct: s.sideAPct,
      sideAPct_60sAgo: s.sideAPct_60sAgo,
      prevSideAPct,
      lastSwingTs: s.lastSwingTs,
      lastFlipTs: s.lastFlipTs,
    });
    s.swing60s = swing.swing60s;
    s.lastSwingTs = swing.nextLastSwingTs;
    s.lastFlipTs = swing.nextLastFlipTs;

    if (bet.kind === "whale") {
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: "WHALE_HIT",
          eventId: bet.eventId,
          message: `WHALE HIT ${Math.round(bet.stake).toLocaleString()} · ${bet.country}`,
          side: bet.side,
          stake: bet.stake,
          country: bet.country,
        }),
      );
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: "WHALE",
          eventId: bet.eventId,
          message: `WHALE ${Math.round(bet.stake).toLocaleString()} · ${bet.country}`,
          side: bet.side,
          stake: bet.stake,
          country: bet.country,
        }),
      );
    }

    if (swing.didSwing) {
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: "BIG_SWING",
          eventId: bet.eventId,
          message: `BIG SWING ${(s.swing60s * 100).toFixed(1)}pts`,
          delta: s.swing60s,
          line: s.line,
        }),
      );
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: "SWING",
          eventId: bet.eventId,
          message: `SWING ${(s.swing60s * 100).toFixed(1)}pts`,
          delta: s.swing60s,
          line: s.line,
        }),
      );
    }

    if (swing.didFlip) {
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: "CONSENSUS_FLIP",
          eventId: bet.eventId,
          message: `FLIP ${(s.sideAPct * 100).toFixed(1)}%`,
          delta: s.sideAPct - 0.5,
          line: s.line,
        }),
      );
    }

    // Line movement alerts.
    const move = s.lineMove60s;
    if (Math.abs(move) >= 0.02 && nowMs - s.lastLineTs > 7_500) {
      s.lastLineTs = nowMs;
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: "LINE_MOVE",
          eventId: bet.eventId,
          message: `LINE MOVE ${(Math.abs(move) * 100).toFixed(1)}pts`,
          delta: move,
          line: s.line,
        }),
      );
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: move >= 0 ? "LINE_UP" : "LINE_DOWN",
          eventId: bet.eventId,
          message: `${move >= 0 ? "LINE UP" : "LINE DOWN"} ${(Math.abs(move) * 100).toFixed(1)}pts`,
          delta: move,
          line: s.line,
        }),
      );
    }

    // Cascade triggers.
    const cascade = this.cascades.get(bet.eventId) ?? makeCascadeState(bet.eventId);
    const intensityCascade = intensity.cascade;
    const triggers: CascadeTrigger[] = [];

    if (bet.kind === "whale") triggers.push({ kind: "whale", side: bet.side, magnitude01: 1 });
    if (swing.didFlip)
      triggers.push({
        kind: "consensus_flip",
        side: s.sideAPct >= 0.5 ? "A" : "B",
        magnitude01: 0.95,
      });
    if (Math.abs(s.swing60s) > 0.06)
      triggers.push({
        kind: "swing",
        side: s.swing60s >= 0 ? "A" : "B",
        magnitude01: clamp01(Math.abs(s.swing60s) / 0.12),
      });
    if (Math.abs(s.lineMove60s) > 0.03)
      triggers.push({
        kind: "line",
        side: s.lineMove60s >= 0 ? "A" : "B",
        magnitude01: clamp01(Math.abs(s.lineMove60s) / 0.08),
      });

    let nextCascade = cascade;
    let started = false;
    for (const t of triggers) {
      const res = maybeTriggerCascade({
        state: nextCascade,
        nowMs,
        trigger: t,
        behavior: this.behavior.cascade,
        intensityCascadeMult: intensityCascade,
      });
      nextCascade = res.state;
      started = started || res.didStart;
    }
    if (started) {
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: "COPY_WAVE",
          eventId: bet.eventId,
          message: `COPY WAVE ${nextCascade.biasSide ?? "?"} ×${nextCascade.rateBoost.toFixed(2)}`,
          side: nextCascade.biasSide ?? undefined,
        }),
      );
      out.push(
        this.makeConsoleEvent({
          tsMs: nowMs,
          type: "CASCADE_START",
          eventId: bet.eventId,
          message: `CASCADE ${nextCascade.biasSide ?? "?"} ×${nextCascade.rateBoost.toFixed(2)}`,
          side: nextCascade.biasSide ?? undefined,
        }),
      );
    }
    this.cascades.set(bet.eventId, nextCascade);

    return out;
  }

  private makeConsoleEvent(args: Omit<ConsoleEvent, "id" | "sport" | "league" | "eventName">): ConsoleEvent {
    const ev = this.eventsById[args.eventId];
    return {
      id: `C${this.consoleSeq++}`,
      tsMs: args.tsMs,
      type: args.type,
      eventId: args.eventId,
      sport: ev?.sport ?? "",
      league: ev?.league ?? "",
      eventName: ev?.eventName ?? "",
      message: args.message,
      side: args.side,
      delta: args.delta,
      line: args.line,
      stake: args.stake,
      country: args.country,
    };
  }
}

