import behaviorPack from "@/data/behavior.json";
import countriesPack from "@/data/countries.json";
import scenariosPack from "@/data/scenarios.json";
import templatesPack from "@/data/events.templates.json";
import sportsByCountryPack from "@/data/sportsByCountry.json";

import { clamp01 } from "./decay";
import {
  MarketAggregator,
  type BehaviorPack,
  type BetEvent,
  type ConsoleEvent,
  type IntensityMode,
  type SimEvent,
} from "./aggregator";
import { pickWeighted } from "./weighted";
import type { BetKind, BetSide } from "./line";
import type { CascadeState } from "./cascade";

type Country = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  weight: number;
  channelMix: Record<string, number>;
};

type ScenarioDef = {
  id: string;
  label: string;
  seed: number;
  intensityMode: IntensityMode;
  regionBias: Record<string, number>;
  eventTemplateIds: string[];
};

type EventTemplate = {
  id: string;
  sport: string;
  league: string;
  eventName: string;
  market: string;
  country: string;
  lat: number;
  lng: number;
  popularity: number;
  favoriteSide: BetSide;
  startOffsetMin: number;
};

type SportsByCountry = Record<string, Array<{ sport: string; weight: number }>>;

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMuller(rand: () => number) {
  const u = Math.max(1e-12, rand());
  const v = Math.max(1e-12, rand());
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function logNormal(rand: () => number, mu: number, sigma: number) {
  const z = boxMuller(rand);
  return Math.exp(mu + sigma * z);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export type EnginePublishPayload = {
  events: BetEvent[];
  markets: Record<string, ReturnType<MarketAggregator["snapshot"]>[string]>;
  consoleEvents: ConsoleEvent[];
  cascades: ReturnType<MarketAggregator["cascadeSnapshot"]>;
  nowMs: number;
};

export type ScenarioSummary = { id: string; label: string; intensityMode: IntensityMode };

export function getScenarioSummaries(): ScenarioSummary[] {
  const scenarios = scenariosPack as unknown as ScenarioDef[];
  return scenarios.map((s) => ({ id: s.id, label: s.label, intensityMode: s.intensityMode ?? "NORMAL" }));
}

export function getScenarioById(id: string): ScenarioDef {
  const scenarios = scenariosPack as unknown as ScenarioDef[];
  return scenarios.find((s) => s.id === id) ?? scenarios[0]!;
}

export class SimEngine {
  readonly scenario: ScenarioDef;
  readonly events: SimEvent[];
  readonly eventsById: Record<string, SimEvent>;

  private readonly rand: () => number;
  private readonly behavior: BehaviorPack;
  private readonly countries: Country[];
  private readonly countryByCode: Map<string, Country>;
  private readonly sportsByCountry: SportsByCountry;
  private readonly regionBias: Record<string, number>;
  private readonly eventsBySport: Map<string, SimEvent[]>;

  private readonly agg: MarketAggregator;
  private nowMs: number;
  private lastPublishAtMs = 0;

  private betSeq = 0;
  private betRing: BetEvent[] = [];
  private consoleRing: ConsoleEvent[] = [];

  constructor(args: { scenarioId: string; nowMs?: number }) {
    this.scenario = getScenarioById(args.scenarioId);

    this.nowMs = args.nowMs ?? Date.now();
    this.rand = mulberry32(this.scenario.seed);

    this.behavior = behaviorPack as unknown as BehaviorPack;
    this.countries = countriesPack as unknown as Country[];
    this.countryByCode = new Map(this.countries.map((c) => [c.code, c] as const));
    this.sportsByCountry = sportsByCountryPack as unknown as SportsByCountry;
    this.regionBias = this.scenario.regionBias ?? {};

    const templates = templatesPack as unknown as EventTemplate[];
    const byId = new Map(templates.map((t) => [t.id, t] as const));
    const events: SimEvent[] = this.scenario.eventTemplateIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((t) => ({
        id: t!.id,
        sport: t!.sport,
        league: t!.league,
        eventName: t!.eventName,
        eventLat: t!.lat,
        eventLng: t!.lng,
        country: t!.country,
        popularity: clamp01(t!.popularity),
        favoriteSide: t!.favoriteSide,
        startTimeMs: this.nowMs + t!.startOffsetMin * 60_000,
      }));

    this.events = events;
    this.eventsById = Object.fromEntries(events.map((e) => [e.id, e] as const));
    this.eventsBySport = new Map<string, SimEvent[]>();
    for (const ev of events) {
      const list = this.eventsBySport.get(ev.sport) ?? [];
      list.push(ev);
      this.eventsBySport.set(ev.sport, list);
    }

    this.agg = new MarketAggregator(this.eventsById, this.behavior, this.nowMs, this.rand);
  }

  tick(dtMs: number, config: { intensityMode: IntensityMode }): EnginePublishPayload | null {
    this.nowMs += dtMs;
    const intensity = this.behavior.intensityModes[config.intensityMode] ?? this.behavior.intensityModes.NORMAL;

    // Advance decay windows + cascades.
    this.agg.advanceTo(this.nowMs);

    // Precompute per-event selection weights for this tick.
    const dtS = dtMs / 1000;
    const weightsBySport = new Map<string, Array<{ item: SimEvent; weight: number }>>();
    let totalWeight = 0;

    for (const ev of this.events) {
      const w = this.eventWeight(ev, intensity.betRate);
      totalWeight += w;
      const list = weightsBySport.get(ev.sport) ?? [];
      list.push({ item: ev, weight: w });
      weightsBySport.set(ev.sport, list);
    }

    const expectedTotal = totalWeight * dtS;
    const nTotal = Math.floor(expectedTotal) + (this.rand() < expectedTotal - Math.floor(expectedTotal) ? 1 : 0);

    for (let i = 0; i < nTotal; i++) {
      const country = this.pickCountry();
      const sport = this.pickSport(country);
      const ev =
        (weightsBySport.get(sport) ? pickWeighted(this.rand, weightsBySport.get(sport)!) : null) ??
        pickWeighted(this.rand, this.events.map((e) => ({ item: e, weight: this.eventWeight(e, intensity.betRate) })));

      const market = this.agg.getMarketState(ev.id);
      const channel = this.pickChannel(country);
      const origin = this.originForCountry(country);
      const cascade = this.agg.getCascade(ev.id);
      const kind = this.betKind({
        intensity,
        marketLine: market?.line ?? 0.5,
        marketSideAPct: market?.sideAPct ?? 0.5,
        cascadeActive: cascade ? this.nowMs < cascade.activeUntilMs : false,
      });
      const stake = this.stakeFor(kind, intensity.betRate);

      const side = this.betSideFor(ev, country, kind, cascade);

      const bet: BetEvent = {
        id: `B${this.betSeq++}`,
        tsMs: this.nowMs,
        eventId: ev.id,
        country,
        channel,
        origin,
        sport: ev.sport,
        league: ev.league,
        eventName: ev.eventName,
        side,
        stake,
        kind,
      };

      this.betRing.push(bet);
      if (this.betRing.length > 5000) this.betRing.shift();

      const events = this.agg.applyBet(bet, config.intensityMode);
      for (const ce of events) this.pushConsole(ce);
    }

    // Throttle publishes to reduce rerenders + map churn.
    const publishEveryMs = 160;
    if (this.nowMs - this.lastPublishAtMs < publishEveryMs) return null;
    this.lastPublishAtMs = this.nowMs;
    return {
      events: this.betRing.slice(-5000),
      markets: this.agg.snapshot(),
      consoleEvents: this.consoleRing.slice(-420),
      cascades: this.agg.cascadeSnapshot(),
      nowMs: this.nowMs,
    };
  }

  private pushConsole(ce: ConsoleEvent) {
    this.consoleRing.push(ce);
    if (this.consoleRing.length > 600) this.consoleRing.shift();
  }

  private pickCountry(): string {
    const items = this.countries.map((c) => {
      const bias = Math.abs(this.regionBias[c.code] ?? 0);
      return { item: c.code, weight: Math.max(0, c.weight) * (1 + bias * 0.25) };
    });
    return pickWeighted(this.rand, items);
  }

  private pickSport(country: string): string {
    const list = this.sportsByCountry[country] ?? [];
    const available = new Set(this.eventsBySport.keys());
    const filtered = list.filter((s) => available.has(s.sport));
    if (filtered.length > 0) return pickWeighted(this.rand, filtered.map((x) => ({ item: x.sport, weight: x.weight })));
    // Fallback: pick any sport represented in this scenario.
    const sports = Array.from(available);
    return sports[Math.floor(this.rand() * sports.length)] ?? this.events[0]?.sport ?? "Football";
  }

  private pickChannel(country: string): string {
    const c = this.countryByCode.get(country);
    const mix = c?.channelMix ?? { mobile: 0.6, desktop: 0.3, affiliate: 0.1 };
    const items = Object.entries(mix).map(([k, w]) => ({ item: k, weight: w }));
    return pickWeighted(this.rand, items);
  }

  private originForCountry(country: string) {
    const c = this.countryByCode.get(country);
    const lat = c?.lat ?? 38;
    const lng = c?.lng ?? -97;
    // Jitter for more organic map flows.
    const jLat = (this.rand() - 0.5) * 3.0;
    const jLng = (this.rand() - 0.5) * 3.0;
    return { lat: lat + jLat, lng: lng + jLng };
  }

  private betKind(args: {
    intensity: BehaviorPack["intensityModes"][IntensityMode];
    marketLine: number;
    marketSideAPct: number;
    cascadeActive: boolean;
  }): BetKind {
    const r = this.rand();
    const base = this.behavior.rates;

    const lineSteep = Math.abs(args.marketLine - 0.5); // 0..0.3
    const steep01 = clamp01((lineSteep - 0.08) / 0.18);
    const lopsided = Math.abs(args.marketSideAPct - 0.5); // 0..0.5
    const lopsided01 = clamp01((lopsided - 0.06) / 0.22);

    // Whale/spike waves become more likely during cascades.
    const whale = Math.min(0.04, base.whaleChance * args.intensity.whale * (args.cascadeActive ? 1.15 : 1));

    // Sharps emerge when the line is steep and/or consensus is lopsided.
    const sharpBase = base.sharpInjectionRate * args.intensity.sharp;
    const sharp = Math.min(0.14, sharpBase * (1 + 1.7 * steep01 + 1.1 * lopsided01));

    const spikeBase = base.spikeChance * args.intensity.betRate;
    const spike = Math.min(0.14, spikeBase * (args.cascadeActive ? 1.1 : 1));

    if (r < whale) return "whale";
    if (r < whale + sharp) return "sharp";
    if (r < whale + sharp + spike) return "spike";
    return "normal";
  }

  private stakeFor(kind: BetKind, intensityRate: number) {
    const stakeCfg = this.behavior.stake;
    const base = logNormal(this.rand, stakeCfg.logNormalMu, stakeCfg.logNormalSigma);
    const scaled = base * lerp(0.7, 1.7, clamp01((intensityRate - 0.6) / 1.2));

    const min = stakeCfg.min;
    const max = stakeCfg.max;
    if (kind === "whale")
      return Math.min(stakeCfg.whaleMax, Math.max(stakeCfg.whaleMin, scaled * stakeCfg.whaleMultiplier));
    if (kind === "sharp") return Math.min(stakeCfg.sharpMax, Math.max(3000, scaled * stakeCfg.sharpMultiplier));
    if (kind === "spike") return Math.min(stakeCfg.spikeMax, Math.max(2000, scaled * stakeCfg.spikeMultiplier));
    return Math.min(max, Math.max(min, scaled));
  }

  private betSideFor(ev: SimEvent, country: string, kind: BetKind, cascade: CascadeState | null): BetSide {
    const bias = (this.regionBias[country] ?? 0) * 0.55;
    const favoriteBias = ev.favoriteSide === "A" ? 0.02 : -0.02;

    const m = this.agg.getMarketState(ev.id);
    const sideAPct = m?.sideAPct ?? 0.5;
    const crowdFollow = (sideAPct - 0.5) * 0.55;

    // Sharps are contrarian, especially when the line is steep.
    const line = m?.line ?? 0.5;
    const steep01 = clamp01((Math.abs(line - 0.5) - 0.08) / 0.18);
    const lopsided01 = clamp01((Math.abs(sideAPct - 0.5) - 0.06) / 0.22);
    const sharpContrarian = (kind === "sharp" ? 1 : 0) * (0.9 + 0.8 * steep01 + 0.5 * lopsided01);
    const sharp = kind === "sharp" ? -crowdFollow * sharpContrarian : 0;

    let pA = clamp01(0.5 + bias + favoriteBias + crowdFollow + sharp + (this.rand() - 0.5) * 0.04);

    if (cascade && this.nowMs < cascade.activeUntilMs && cascade.biasSide) {
      const b = clamp01(cascade.biasStrength);
      if (cascade.biasSide === "A") pA = pA + (1 - pA) * b;
      else pA = pA - pA * b;
    }

    return this.rand() < pA ? "A" : "B";
  }

  private eventWeight(ev: SimEvent, intensityRate: number) {
    const cascade = this.agg.getCascade(ev.id);
    const cascadeBoost = cascade && this.nowMs < cascade.activeUntilMs ? cascade.rateBoost : 1;

    const base = this.behavior.rates.baseBetsPerSecond;
    const pop = lerp(0.35, 1.25, ev.popularity);
    const intensity = intensityRate;

    const m = this.agg.getMarketState(ev.id);
    const heatBoost = m ? lerp(0.85, 1.65, clamp01(m.heatScore)) : 1;
    const swingBoost = m ? 1 + clamp01(Math.abs(m.swing60s) / 0.1) * 0.25 : 1;

    const tToStartMin = (ev.startTimeMs - this.nowMs) / 60_000;
    const sigma = this.behavior.timing.nearStartSigmaMinutes || 18;
    const nearStart = Math.exp(-Math.pow(tToStartMin / sigma, 2));
    const amp = this.behavior.timing.nearStartSpikeAmplitude || 2.2;
    const spike = 1 + amp * nearStart;

    return base * pop * intensity * spike * cascadeBoost * heatBoost * swingBoost;
  }
}

