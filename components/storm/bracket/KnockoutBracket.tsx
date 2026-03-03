"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Trophy, X, TrendingUp, Users, BarChart3, Zap,
  ChevronRight, MapPin, Swords, ShieldCheck, Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBracketStore } from "@/store/bracketStore";
import { useParlayStore } from "@/store/parlayStore";
import { teams } from "@/lib/mock/storm";
import { generate1X2 } from "@/lib/odds";

/* ------------------------------------------------------------------ */
/*  Flag helpers                                                       */
/* ------------------------------------------------------------------ */

const flagUrl = (code: string) =>
  `https://flagcdn.com/w80/${code.toLowerCase()}.png`;

const CODE_TO_2: Record<string, string> = {
  BRA: "br", GER: "de", JPN: "jp", NZL: "nz", FRA: "fr", ENG: "gb-eng",
  KOR: "kr", CAN: "ca", ARG: "ar", ESP: "es", MEX: "mx", AUS: "au",
  NED: "nl", POR: "pt", USA: "us", URU: "uy", BEL: "be", CRO: "hr",
  MAR: "ma", SEN: "sn", DEN: "dk", COL: "co", SUI: "ch", ECU: "ec",
  SRB: "rs", CMR: "cm", CRC: "cr", GHA: "gh", POL: "pl", PAR: "py",
  IRN: "ir", NGA: "ng", UKR: "ua",
};

function getFlag(code: string) {
  return flagUrl(CODE_TO_2[code] ?? "xx");
}
function getTeamName(code: string) {
  return teams.find((t) => t.code === code)?.name ?? code;
}

/* ------------------------------------------------------------------ */
/*  Match / team types                                                 */
/* ------------------------------------------------------------------ */

interface SlotTeam {
  code: string;
  name: string;
  seed?: number;
}

interface BracketSlot {
  id: string;
  round: "r16" | "qf" | "sf" | "final";
  matchNum: number;
  venue: string;
  top: SlotTeam | null;
  bottom: SlotTeam | null;
  feedsInto: string | null;
  feedsPosition: "top" | "bottom" | null;
  communityTopPct: number;
}

/* ------------------------------------------------------------------ */
/*  Team stats for intel panel                                         */
/* ------------------------------------------------------------------ */

const TEAM_STATS: Record<string, {
  fifaRank: number; odds: number; formLast5: string;
  topScorer: string; goals: number; possession: number;
  cleanSheets: number; xG: number;
}> = {
  BRA: { fifaRank: 1, odds: 3.5, formLast5: "WWDWW", topScorer: "Vinicius Jr", goals: 12, possession: 58, cleanSheets: 3, xG: 14.2 },
  ENG: { fifaRank: 3, odds: 5.0, formLast5: "WDWWW", topScorer: "Kane", goals: 9, possession: 55, cleanSheets: 2, xG: 10.8 },
  FRA: { fifaRank: 2, odds: 4.0, formLast5: "WWWDL", topScorer: "Mbappé", goals: 11, possession: 56, cleanSheets: 3, xG: 13.1 },
  ESP: { fifaRank: 6, odds: 6.0, formLast5: "WWWWW", topScorer: "Yamal", goals: 10, possession: 64, cleanSheets: 4, xG: 12.5 },
  ARG: { fifaRank: 5, odds: 4.5, formLast5: "WDWWW", topScorer: "Messi", goals: 8, possession: 57, cleanSheets: 3, xG: 10.1 },
  NED: { fifaRank: 7, odds: 10.0, formLast5: "WWDWL", topScorer: "Gakpo", goals: 7, possession: 54, cleanSheets: 2, xG: 8.9 },
  POR: { fifaRank: 8, odds: 8.0, formLast5: "WDWWD", topScorer: "Ronaldo", goals: 6, possession: 53, cleanSheets: 2, xG: 8.4 },
  GER: { fifaRank: 4, odds: 7.0, formLast5: "WLWWW", topScorer: "Musiala", goals: 8, possession: 59, cleanSheets: 2, xG: 10.5 },
  USA: { fifaRank: 11, odds: 15.0, formLast5: "WDWWL", topScorer: "Pulisic", goals: 5, possession: 50, cleanSheets: 1, xG: 6.7 },
  MEX: { fifaRank: 15, odds: 22.0, formLast5: "DWWDL", topScorer: "Lozano", goals: 4, possession: 48, cleanSheets: 1, xG: 5.9 },
  CRO: { fifaRank: 10, odds: 12.0, formLast5: "WDWWW", topScorer: "Kramarić", goals: 6, possession: 56, cleanSheets: 2, xG: 7.8 },
  BEL: { fifaRank: 9, odds: 11.0, formLast5: "WWDWL", topScorer: "De Bruyne", goals: 7, possession: 57, cleanSheets: 2, xG: 9.1 },
  COL: { fifaRank: 16, odds: 20.0, formLast5: "WWWDL", topScorer: "Díaz", goals: 5, possession: 52, cleanSheets: 1, xG: 6.3 },
  DEN: { fifaRank: 13, odds: 18.0, formLast5: "WDWDW", topScorer: "Højlund", goals: 5, possession: 51, cleanSheets: 2, xG: 6.5 },
  URU: { fifaRank: 14, odds: 16.0, formLast5: "WDWWW", topScorer: "Núñez", goals: 6, possession: 49, cleanSheets: 1, xG: 7.2 },
  MAR: { fifaRank: 12, odds: 14.0, formLast5: "WWWWD", topScorer: "Hakimi", goals: 5, possession: 50, cleanSheets: 3, xG: 6.8 },
};

/* ------------------------------------------------------------------ */
/*  Build bracket structure (R16 → QF → SF → Final)                   */
/* ------------------------------------------------------------------ */

const VENUES = [
  "New York/NJ", "Los Angeles", "Dallas", "Miami",
  "Atlanta", "Boston", "Mexico City", "Toronto",
];

function buildBracket(): BracketSlot[] {
  const r16: BracketSlot[] = [
    { id: "r16-1", round: "r16", matchNum: 49, venue: VENUES[0], top: { code: "BRA", name: "Brazil", seed: 1 }, bottom: { code: "COL", name: "Colombia", seed: 16 }, feedsInto: "qf-1", feedsPosition: "top", communityTopPct: 78 },
    { id: "r16-2", round: "r16", matchNum: 50, venue: VENUES[1], top: { code: "ENG", name: "England", seed: 8 }, bottom: { code: "DEN", name: "Denmark", seed: 9 }, feedsInto: "qf-1", feedsPosition: "bottom", communityTopPct: 72 },
    { id: "r16-3", round: "r16", matchNum: 51, venue: VENUES[2], top: { code: "FRA", name: "France", seed: 4 }, bottom: { code: "CRO", name: "Croatia", seed: 13 }, feedsInto: "qf-2", feedsPosition: "top", communityTopPct: 65 },
    { id: "r16-4", round: "r16", matchNum: 52, venue: VENUES[3], top: { code: "ESP", name: "Spain", seed: 5 }, bottom: { code: "USA", name: "United States", seed: 12 }, feedsInto: "qf-2", feedsPosition: "bottom", communityTopPct: 58 },
    { id: "r16-5", round: "r16", matchNum: 53, venue: VENUES[4], top: { code: "ARG", name: "Argentina", seed: 2 }, bottom: { code: "MEX", name: "Mexico", seed: 15 }, feedsInto: "qf-3", feedsPosition: "top", communityTopPct: 82 },
    { id: "r16-6", round: "r16", matchNum: 54, venue: VENUES[5], top: { code: "NED", name: "Netherlands", seed: 7 }, bottom: { code: "MAR", name: "Morocco", seed: 10 }, feedsInto: "qf-3", feedsPosition: "bottom", communityTopPct: 55 },
    { id: "r16-7", round: "r16", matchNum: 55, venue: VENUES[6], top: { code: "POR", name: "Portugal", seed: 3 }, bottom: { code: "URU", name: "Uruguay", seed: 14 }, feedsInto: "qf-4", feedsPosition: "top", communityTopPct: 60 },
    { id: "r16-8", round: "r16", matchNum: 56, venue: VENUES[7], top: { code: "GER", name: "Germany", seed: 6 }, bottom: { code: "BEL", name: "Belgium", seed: 11 }, feedsInto: "qf-4", feedsPosition: "bottom", communityTopPct: 52 },
  ];

  const qf: BracketSlot[] = [
    { id: "qf-1", round: "qf", matchNum: 89, venue: VENUES[0], top: null, bottom: null, feedsInto: "sf-1", feedsPosition: "top", communityTopPct: 50 },
    { id: "qf-2", round: "qf", matchNum: 90, venue: VENUES[1], top: null, bottom: null, feedsInto: "sf-1", feedsPosition: "bottom", communityTopPct: 50 },
    { id: "qf-3", round: "qf", matchNum: 91, venue: VENUES[2], top: null, bottom: null, feedsInto: "sf-2", feedsPosition: "top", communityTopPct: 50 },
    { id: "qf-4", round: "qf", matchNum: 92, venue: VENUES[3], top: null, bottom: null, feedsInto: "sf-2", feedsPosition: "bottom", communityTopPct: 50 },
  ];

  const sf: BracketSlot[] = [
    { id: "sf-1", round: "sf", matchNum: 97, venue: VENUES[0], top: null, bottom: null, feedsInto: "final", feedsPosition: "top", communityTopPct: 50 },
    { id: "sf-2", round: "sf", matchNum: 98, venue: VENUES[1], top: null, bottom: null, feedsInto: "final", feedsPosition: "bottom", communityTopPct: 50 },
  ];

  const final: BracketSlot[] = [
    { id: "final", round: "final", matchNum: 104, venue: VENUES[0], top: null, bottom: null, feedsInto: null, feedsPosition: null, communityTopPct: 50 },
  ];

  return [...r16, ...qf, ...sf, ...final];
}

/* ------------------------------------------------------------------ */
/*  Propagate user picks through the bracket                           */
/* ------------------------------------------------------------------ */

function propagatePicks(
  slots: BracketSlot[],
  picks: Record<string, string>
): BracketSlot[] {
  const result = slots.map((s) => ({ ...s }));
  const byId = new Map(result.map((s) => [s.id, s]));

  for (const slot of result) {
    const pick = picks[slot.id];
    if (!pick || !slot.feedsInto) continue;
    const target = byId.get(slot.feedsInto);
    if (!target) continue;
    const winner =
      pick === slot.top?.code ? slot.top
      : pick === slot.bottom?.code ? slot.bottom
      : null;
    if (!winner) continue;
    if (slot.feedsPosition === "top") target.top = { ...winner };
    else target.bottom = { ...winner };
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const ROUND_CONFIG = {
  r16:   { cardW: 180, cardH: 60, gap: 12, label: "ROUND OF 16" },
  qf:    { cardW: 195, cardH: 68, gap: 44, label: "QUARTER-FINALS" },
  sf:    { cardW: 210, cardH: 74, gap: 100, label: "SEMI-FINALS" },
  final: { cardW: 240, cardH: 84, gap: 0, label: "FINAL" },
} as const;

const COL_GAP = 56;
const LEFT_ROUNDS: Array<"r16" | "qf" | "sf" | "final"> = ["r16", "qf", "sf", "final"];
const RIGHT_ROUNDS: Array<"r16" | "qf" | "sf"> = ["r16", "qf", "sf"];

function getLeftRoundSlots(round: string, allSlots: BracketSlot[]) {
  const roundSlots = allSlots.filter((s) => s.round === round);
  if (round === "final") return roundSlots;
  return roundSlots.slice(0, roundSlots.length / 2);
}
function getRightRoundSlots(round: string, allSlots: BracketSlot[]) {
  const roundSlots = allSlots.filter((s) => s.round === round);
  return roundSlots.slice(roundSlots.length / 2);
}

/* ------------------------------------------------------------------ */
/*  Match card component                                               */
/* ------------------------------------------------------------------ */

function MatchCard({
  slot,
  config,
  picked,
  onPickTeam,
  isHovered,
  onHover,
  highlightPath,
  selectedForIntel,
  onSelectForIntel,
}: {
  slot: BracketSlot;
  config: typeof ROUND_CONFIG[keyof typeof ROUND_CONFIG];
  picked: string | null;
  onPickTeam: (slotId: string, teamCode: string) => void;
  isHovered: string | null;
  onHover: (code: string | null) => void;
  highlightPath: Set<string>;
  selectedForIntel: boolean;
  onSelectForIntel: (slotId: string) => void;
}) {
  const isFinal = slot.round === "final";
  const topPicked = picked === slot.top?.code;
  const botPicked = picked === slot.bottom?.code;
  const anyPicked = topPicked || botPicked;
  const isOnPath = highlightPath.has(slot.id);

  return (
    <div
      onClick={() => onSelectForIntel(slot.id)}
      className={
        "group relative rounded-lg border overflow-hidden transition-all duration-300 cursor-pointer " +
        (isFinal
          ? "border-storm-gold/50 shadow-[0_0_24px_rgba(200,170,60,0.08)] "
          : isOnPath
            ? "border-storm-accent/60 shadow-[0_0_12px_rgba(85,130,230,0.12)] "
            : "border-border/30 ") +
        (selectedForIntel
          ? "ring-2 ring-storm-accent/80 scale-[1.03] "
          : "hover:border-border/60 hover:shadow-lg hover:scale-[1.01] ") +
        "bg-card"
      }
      style={{ width: config.cardW }}
    >
      {/* Match header */}
      <div className={
        "flex items-center justify-between px-2.5 py-1 text-[9px] font-medium " +
        (isFinal ? "bg-storm-gold/10 text-storm-gold/90" : "bg-storm-surface/50 text-muted-foreground")
      }>
        <span>M{slot.matchNum}</span>
        <span className="flex items-center gap-0.5 truncate ml-1">
          <MapPin className="h-2.5 w-2.5 shrink-0" />{slot.venue}
        </span>
      </div>

      {/* Top team */}
      <TeamRow
        team={slot.top}
        isPicked={topPicked}
        isEliminated={botPicked}
        round={slot.round}
        onPick={() => slot.top && onPickTeam(slot.id, slot.top.code)}
        onMouseEnter={() => slot.top && onHover(slot.top.code)}
        onMouseLeave={() => onHover(null)}
        isHovered={isHovered === slot.top?.code}
        opponentRank={slot.bottom ? TEAM_STATS[slot.bottom.code]?.fifaRank : undefined}
        slotId={slot.id}
        position="top"
      />

      <div className="h-px bg-border/20" />

      {/* Bottom team */}
      <TeamRow
        team={slot.bottom}
        isPicked={botPicked}
        isEliminated={topPicked}
        round={slot.round}
        onPick={() => slot.bottom && onPickTeam(slot.id, slot.bottom.code)}
        onMouseEnter={() => slot.bottom && onHover(slot.bottom.code)}
        onMouseLeave={() => onHover(null)}
        isHovered={isHovered === slot.bottom?.code}
        opponentRank={slot.top ? TEAM_STATS[slot.top.code]?.fifaRank : undefined}
        slotId={slot.id}
        position="bottom"
      />

      {/* Community bar */}
      {slot.top && slot.bottom && (
        <div className="h-0.5 flex">
          <div className="bg-storm-accent/50 transition-all" style={{ width: `${slot.communityTopPct}%` }} />
          <div className="bg-storm-ride/40 flex-1" />
        </div>
      )}
    </div>
  );
}

function TeamRow({
  team, isPicked, isEliminated, round, onPick,
  onMouseEnter, onMouseLeave, isHovered,
  opponentRank, slotId, position,
}: {
  team: SlotTeam | null;
  isPicked: boolean;
  isEliminated: boolean;
  round: string;
  onPick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isHovered: boolean;
  opponentRank?: number;
  slotId?: string;
  position: "top" | "bottom";
}) {
  const isFinal = round === "final";

  const teamOdds = useMemo(() => {
    if (!team || opponentRank == null || !slotId) return null;
    const stats = TEAM_STATS[team.code];
    if (!stats) return null;
    const odds = position === "top"
      ? generate1X2(stats.fifaRank, opponentRank, slotId)
      : generate1X2(opponentRank, stats.fifaRank, slotId);
    return position === "top" ? odds.home : odds.away;
  }, [team, opponentRank, slotId, position]);

  if (!team) {
    return (
      <div className={`flex items-center gap-2 px-2.5 ${isFinal ? "py-3" : "py-2"}`}>
        <div className="h-4 w-6 rounded bg-muted/20 animate-pulse" />
        <span className="text-[10px] text-muted-foreground/40 italic">TBD</span>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onPick(); }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={
        "flex items-center gap-2 px-2.5 transition-all duration-200 " +
        (isFinal ? "py-3 " : "py-2 ") +
        (isPicked
          ? "bg-storm-live/10 "
          : isEliminated
            ? "opacity-40 "
            : isHovered
              ? "bg-storm-accent/5 "
              : "hover:bg-storm-surface/60 ")
      }
    >
      <img src={getFlag(team.code)} alt="" className={`shrink-0 rounded object-cover shadow-sm ${isFinal ? "h-6 w-8" : "h-4 w-6"}`} />
      <span className={
        "font-mono tracking-wide " +
        (isFinal ? "text-sm " : "text-xs ") +
        (isPicked ? "font-bold text-storm-live" : isEliminated ? "text-muted-foreground" : "font-medium text-foreground")
      }>
        {team.code}
      </span>
      {teamOdds != null && (
        <span className="text-[9px] font-mono text-muted-foreground">{teamOdds.toFixed(2)}</span>
      )}
      {isPicked && (
        <ShieldCheck className={`ml-auto ${isFinal ? "h-4 w-4" : "h-3 w-3"} text-storm-live`} />
      )}
      {!isPicked && !isEliminated && team.seed && !teamOdds && (
        <span className="ml-auto text-[8px] text-muted-foreground/50">#{team.seed}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SVG connectors                                                     */
/* ------------------------------------------------------------------ */

interface ConnectorLine {
  x1: number; y1: number;
  x2: number; y2: number;
  active: boolean;
}

function computeConnectors(
  slots: BracketSlot[],
  positions: Map<string, { x: number; y: number; w: number; h: number }>,
  side: "left" | "right",
  highlightPath: Set<string>,
): ConnectorLine[] {
  const lines: ConnectorLine[] = [];

  for (const slot of slots) {
    if (!slot.feedsInto) continue;
    const from = positions.get(slot.id);
    const to = positions.get(slot.feedsInto);
    if (!from || !to) continue;

    const fromX = side === "left" ? from.x + from.w : from.x;
    const fromY = from.y + from.h / 2;
    const toX = side === "left" ? to.x : to.x + to.w;
    const toY = to.y + to.h / 2;

    lines.push({
      x1: fromX,
      y1: fromY,
      x2: toX,
      y2: toY,
      active: highlightPath.has(slot.id) && highlightPath.has(slot.feedsInto),
    });
  }
  return lines;
}

function BracketSVG({ lines, width, height }: { lines: ConnectorLine[]; width: number; height: number }) {
  return (
    <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
      {lines.map((l, i) => {
        const midX = (l.x1 + l.x2) / 2;
        const d = `M ${l.x1} ${l.y1} C ${midX} ${l.y1}, ${midX} ${l.y2}, ${l.x2} ${l.y2}`;
        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke={l.active ? "oklch(0.65 0.18 250 / 0.7)" : "oklch(0.6 0 0 / 0.15)"}
              strokeWidth={l.active ? 2.5 : 1.5}
              className="transition-all duration-500"
            />
            {l.active && (
              <path
                d={d}
                fill="none"
                stroke="oklch(0.55 0.18 250 / 0.15)"
                strokeWidth={6}
                className="transition-all duration-500"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Intel panel                                                        */
/* ------------------------------------------------------------------ */

function IntelPanel({
  slot,
  picks,
  onPick,
  onClose,
}: {
  slot: BracketSlot;
  picks: Record<string, string>;
  onPick: (slotId: string, teamCode: string) => void;
  onClose: () => void;
}) {
  const topStats = slot.top ? TEAM_STATS[slot.top.code] : null;
  const botStats = slot.bottom ? TEAM_STATS[slot.bottom.code] : null;
  const currentPick = picks[slot.id] ?? null;

  return (
    <div className="h-full flex flex-col rounded-xl border border-border/40 bg-card overflow-hidden animate-in slide-in-from-right-5 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-storm-surface shrink-0">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-storm-accent" />
          <span className="text-xs font-bold tracking-wide">MATCH INTEL</span>
          <Badge variant="outline" className="text-[9px] h-4">
            {slot.round === "r16" ? "R16" : slot.round.toUpperCase()}
          </Badge>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Matchup */}
        <div className="px-4 py-5">
          <div className="flex items-center justify-center gap-5">
            {slot.top ? (
              <div className="flex flex-col items-center gap-1.5">
                <img src={getFlag(slot.top.code)} alt="" className="h-12 w-16 rounded-lg object-cover shadow-lg" />
                <span className="text-sm font-bold">{slot.top.code}</span>
                <span className="text-[10px] text-muted-foreground">{slot.top.name}</span>
              </div>
            ) : <TBDBlock />}
            <div className="text-center px-2">
              <p className="text-[9px] font-semibold text-storm-gold tracking-widest">
                {slot.round === "final" ? "FINAL" : slot.round === "sf" ? "SEMI-FINAL" : slot.round === "qf" ? "QUARTER-FINAL" : "ROUND OF 16"}
              </p>
              <p className="text-lg font-bold text-muted-foreground/30 my-0.5">VS</p>
              <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 justify-center">
                <MapPin className="h-2.5 w-2.5" />{slot.venue}
              </p>
            </div>
            {slot.bottom ? (
              <div className="flex flex-col items-center gap-1.5">
                <img src={getFlag(slot.bottom.code)} alt="" className="h-12 w-16 rounded-lg object-cover shadow-lg" />
                <span className="text-sm font-bold">{slot.bottom.code}</span>
                <span className="text-[10px] text-muted-foreground">{slot.bottom.name}</span>
              </div>
            ) : <TBDBlock />}
          </div>

          {/* Community split */}
          {slot.top && slot.bottom && (
            <div className="mt-4">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-bold">{slot.communityTopPct}%</span>
                <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />Community</span>
                <span className="font-bold">{100 - slot.communityTopPct}%</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-storm-accent/70 transition-all" style={{ width: `${slot.communityTopPct}%` }} />
                <div className="bg-storm-ride/50 flex-1" />
              </div>
            </div>
          )}
        </div>

        {/* Odds */}
        {topStats && botStats && slot.top && slot.bottom && (
          <>
            <div className="px-4 pb-3">
              <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">ODDS TO WIN TOURNAMENT</p>
              <div className="grid grid-cols-2 gap-2">
                <OddsCard code={slot.top.code} odds={topStats.odds} rank={topStats.fifaRank} />
                <OddsCard code={slot.bottom.code} odds={botStats.odds} rank={botStats.fifaRank} />
              </div>
            </div>

            {/* Stats comparison */}
            <div className="px-4 pb-3">
              <p className="text-[10px] font-semibold text-muted-foreground tracking-wider mb-2">HEAD TO HEAD</p>
              <div className="space-y-2">
                <ComparisonRow label="Goals" left={topStats.goals} right={botStats.goals} />
                <ComparisonRow label="Possession" left={topStats.possession} right={botStats.possession} suffix="%" />
                <ComparisonRow label="xG" left={topStats.xG} right={botStats.xG} />
                <ComparisonRow label="Clean Sheets" left={topStats.cleanSheets} right={botStats.cleanSheets} />
              </div>
            </div>

            {/* Form */}
            <div className="px-4 pb-3 grid grid-cols-2 gap-3">
              <FormCard code={slot.top.code} stats={topStats} />
              <FormCard code={slot.bottom.code} stats={botStats} />
            </div>
          </>
        )}

        {/* Pick CTA */}
        {slot.top && slot.bottom && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">YOUR PICK</p>
            <div className="grid grid-cols-2 gap-2">
              <PickButton
                code={slot.top.code}
                name={slot.top.name}
                isPicked={currentPick === slot.top.code}
                onPick={() => onPick(slot.id, slot.top!.code)}
              />
              <PickButton
                code={slot.bottom.code}
                name={slot.bottom.name}
                isPicked={currentPick === slot.bottom.code}
                onPick={() => onPick(slot.id, slot.bottom!.code)}
              />
            </div>
          </div>
        )}

        {(!slot.top || !slot.bottom) && (
          <div className="px-4 pb-4">
            <div className="rounded-lg border border-dashed border-border/40 p-6 text-center">
              <Target className="h-6 w-6 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">
                Pick winners in earlier rounds to unlock this match
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TBDBlock() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-12 w-16 rounded-lg bg-muted/10 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground/30">?</span>
      </div>
      <span className="text-sm font-bold text-muted-foreground/30">TBD</span>
    </div>
  );
}

function OddsCard({ code, odds, rank }: { code: string; odds: number; rank: number }) {
  return (
    <div className="rounded-lg bg-storm-surface px-3 py-2 text-center">
      <p className="text-xs font-bold">{code}</p>
      <p className="text-xl font-mono font-bold text-storm-gold">{odds.toFixed(1)}</p>
      <p className="text-[9px] text-muted-foreground">#{rank} FIFA</p>
    </div>
  );
}

function ComparisonRow({ label, left, right, suffix = "" }: { label: string; left: number; right: number; suffix?: string }) {
  const max = Math.max(left, right);
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className={`w-8 text-right font-mono font-bold ${left >= right ? "text-storm-accent" : "text-muted-foreground"}`}>
        {left}{suffix}
      </span>
      <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-muted/20">
        <div className="bg-storm-accent/60 rounded-l-full" style={{ width: `${(left / (left + right)) * 100}%` }} />
        <div className="bg-storm-ride/50 rounded-r-full flex-1" />
      </div>
      <span className={`w-8 font-mono font-bold ${right >= left ? "text-storm-ride" : "text-muted-foreground"}`}>
        {right}{suffix}
      </span>
      <span className="w-20 text-muted-foreground truncate">{label}</span>
    </div>
  );
}

function FormCard({ code, stats }: { code: string; stats: { formLast5: string; topScorer: string } }) {
  return (
    <div className="rounded-lg bg-storm-surface p-2.5">
      <p className="text-[9px] text-muted-foreground mb-1">{code} Form</p>
      <div className="flex gap-0.5">
        {stats.formLast5.split("").map((r, i) => (
          <span key={i} className={`h-5 w-5 rounded text-[9px] font-bold flex items-center justify-center ${r === "W" ? "bg-storm-live/20 text-storm-live" : r === "D" ? "bg-storm-gold/20 text-storm-gold" : "bg-destructive/20 text-destructive"}`}>
            {r}
          </span>
        ))}
      </div>
      <p className="text-[10px] font-semibold mt-1.5 flex items-center gap-1">
        <Zap className="h-3 w-3 text-storm-gold" />{stats.topScorer}
      </p>
    </div>
  );
}

function PickButton({ code, name, isPicked, onPick }: { code: string; name: string; isPicked: boolean; onPick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onPick(); }}
      className={
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all duration-200 border " +
        (isPicked
          ? "border-storm-live/40 bg-storm-live/10 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
          : "border-border/30 bg-storm-surface hover:border-storm-accent/40 hover:bg-storm-accent/5")
      }
    >
      <img src={getFlag(code)} alt="" className="h-5 w-7 rounded object-cover" />
      <div className="min-w-0">
        <p className={`text-xs font-bold truncate ${isPicked ? "text-storm-live" : ""}`}>{code}</p>
        <p className="text-[9px] text-muted-foreground truncate">{name}</p>
      </div>
      {isPicked && <ShieldCheck className="h-4 w-4 text-storm-live ml-auto shrink-0" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Bracket column                                                     */
/* ------------------------------------------------------------------ */

function BracketColumn({
  slots,
  round,
  picks,
  onPickTeam,
  hoveredTeam,
  onHover,
  highlightPath,
  intelSlotId,
  onSelectForIntel,
  side,
  cardRefs,
}: {
  slots: BracketSlot[];
  round: "r16" | "qf" | "sf" | "final";
  picks: Record<string, string>;
  onPickTeam: (slotId: string, teamCode: string) => void;
  hoveredTeam: string | null;
  onHover: (code: string | null) => void;
  highlightPath: Set<string>;
  intelSlotId: string | null;
  onSelectForIntel: (slotId: string) => void;
  side: "left" | "right";
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}) {
  const config = ROUND_CONFIG[round];
  return (
    <div className="flex flex-col justify-around shrink-0" style={{ gap: config.gap }}>
      <div className={
        "text-[9px] font-semibold uppercase tracking-[0.15em] text-center mb-1 " +
        (round === "final" ? "text-storm-gold" : "text-muted-foreground/60")
      }>
        {config.label}
      </div>
      {slots.map((slot) => (
        <div key={slot.id} ref={(el) => { if (el) cardRefs.current.set(slot.id, el); }}>
          <MatchCard
            slot={slot}
            config={config}
            picked={picks[slot.id] ?? null}
            onPickTeam={onPickTeam}
            isHovered={hoveredTeam}
            onHover={onHover}
            highlightPath={highlightPath}
            selectedForIntel={intelSlotId === slot.id}
            onSelectForIntel={onSelectForIntel}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Champion banner                                                    */
/* ------------------------------------------------------------------ */

function ChampionBanner({ code }: { code: string | null }) {
  if (!code) {
    return (
      <div className="flex flex-col items-center gap-2 py-3">
        <Trophy className="h-10 w-10 text-muted-foreground/20" />
        <p className="text-[10px] text-muted-foreground/40 tracking-widest uppercase">Your Champion</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 py-3 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative">
        <Trophy className="h-12 w-12 text-storm-gold animate-breathe-glow" />
      </div>
      <div className="flex items-center gap-3">
        <img src={getFlag(code)} alt="" className="h-8 w-11 rounded-md object-cover shadow-lg" />
        <div>
          <p className="text-lg font-bold tracking-wide">{getTeamName(code)}</p>
          <p className="text-[10px] text-storm-gold font-semibold tracking-widest">CHAMPION</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main bracket export                                                */
/* ------------------------------------------------------------------ */

export function KnockoutBracket({ zoomToFit = false }: { zoomToFit?: boolean }) {
  const baseSlots = useMemo(() => buildBracket(), []);
  const { knockoutPicks, setKnockoutPick } = useBracketStore();
  const bracketContainerRef = useRef<HTMLDivElement>(null);
  const bracketInnerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const [localPicks, setLocalPicks] = useState<Record<string, string>>({});
  const picks = { ...localPicks, ...Object.fromEntries(
    Object.entries(knockoutPicks).map(([k, v]) => [k, v.winnerId])
  )};

  const slots = useMemo(() => propagatePicks(baseSlots, picks), [baseSlots, picks]);

  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const [intelSlotId, setIntelSlotId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const parlayToggle = useParlayStore((s) => s.toggleLeg);
  const parlayRemove = useParlayStore((s) => s.removeLeg);

  const handlePick = useCallback((slotId: string, teamCode: string) => {
    let isDeselect = false;
    setLocalPicks((prev) => {
      const next = { ...prev };
      if (next[slotId] === teamCode) {
        delete next[slotId];
        isDeselect = true;
      } else {
        next[slotId] = teamCode;
      }
      return next;
    });
    setKnockoutPick(slotId, teamCode);

    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;

    if (isDeselect) {
      parlayRemove(`parlay-${slotId}`);
      return;
    }

    const pickedTeam = slot.top?.code === teamCode ? slot.top : slot.bottom;
    const opponentTeam = slot.top?.code === teamCode ? slot.bottom : slot.top;
    if (!pickedTeam || !opponentTeam) return;

    const myStats = TEAM_STATS[pickedTeam.code];
    const oppStats = TEAM_STATS[opponentTeam.code];
    if (!myStats || !oppStats) return;

    const isTop = slot.top?.code === teamCode;
    const odds1x2 = isTop
      ? generate1X2(myStats.fifaRank, oppStats.fifaRank, slotId)
      : generate1X2(oppStats.fifaRank, myStats.fifaRank, slotId);
    const legOdds = isTop ? odds1x2.home : odds1x2.away;

    parlayToggle({
      id: `parlay-${slotId}`,
      matchId: slotId,
      label: `${pickedTeam.code} to beat ${opponentTeam.code}`,
      odds: legOdds,
      teamCode,
      round: slot.round,
    });
  }, [setKnockoutPick, slots, parlayToggle, parlayRemove]);

  const handleSelectForIntel = useCallback((slotId: string) => {
    setIntelSlotId((prev) => (prev === slotId ? null : slotId));
  }, []);

  const highlightPath = useMemo(() => {
    const path = new Set<string>();
    if (!hoveredTeam) return path;
    for (const slot of slots) {
      if (slot.top?.code === hoveredTeam || slot.bottom?.code === hoveredTeam) {
        path.add(slot.id);
      }
    }
    return path;
  }, [hoveredTeam, slots]);

  const intelSlot = slots.find((s) => s.id === intelSlotId) ?? null;

  const finalSlot = slots.find((s) => s.round === "final");
  const championCode = finalSlot
    ? picks["final"]
      ? picks["final"]
      : null
    : null;

  const leftR16 = getLeftRoundSlots("r16", slots);
  const leftQF = getLeftRoundSlots("qf", slots);
  const leftSF = getLeftRoundSlots("sf", slots);
  const rightR16 = getRightRoundSlots("r16", slots);
  const rightQF = getRightRoundSlots("qf", slots);
  const rightSF = getRightRoundSlots("sf", slots);
  const finalSlots = slots.filter((s) => s.round === "final");

  useEffect(() => {
    if (!zoomToFit) {
      setScale(1);
      return;
    }
    function computeScale() {
      const container = bracketContainerRef.current;
      const inner = bracketInnerRef.current;
      if (!container || !inner) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const iw = inner.scrollWidth;
      const ih = inner.scrollHeight;
      if (iw === 0 || ih === 0) return;
      const s = Math.min(cw / iw, ch / ih, 1);
      setScale(Math.max(0.3, s));
    }
    computeScale();
    const ro = new ResizeObserver(computeScale);
    if (bracketContainerRef.current) ro.observe(bracketContainerRef.current);
    return () => ro.disconnect();
  }, [zoomToFit, slots]);

  return (
    <div className="space-y-4">
      {/* Two-column: bracket + intel */}
      <div className="flex gap-4">
        {/* Bracket area */}
        <div
          ref={bracketContainerRef}
          className={
            "flex-1 rounded-xl border border-border/30 bg-card/50 " +
            (zoomToFit ? "overflow-hidden" : "overflow-x-auto")
          }
        >
          <div
            ref={bracketInnerRef}
            className="relative p-4 sm:p-6 min-w-max"
            style={zoomToFit ? { transform: `scale(${scale})`, transformOrigin: "top center" } : undefined}
          >
            {/* Champion at top center */}
            <div className="flex justify-center mb-4">
              <div className="rounded-xl border border-storm-gold/20 bg-gradient-to-b from-storm-gold/5 to-transparent px-8 py-2 min-w-[240px]">
                <ChampionBanner code={championCode} />
              </div>
            </div>

            {/* Bracket tree */}
            <div className="relative flex items-stretch justify-center gap-4">
              {/* Left side: R16 → QF → SF */}
              <BracketColumn slots={leftR16} round="r16" picks={picks} onPickTeam={handlePick} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} highlightPath={highlightPath} intelSlotId={intelSlotId} onSelectForIntel={handleSelectForIntel} side="left" cardRefs={cardRefs} />
              <div className="flex items-center"><ConnectorGap /></div>
              <BracketColumn slots={leftQF} round="qf" picks={picks} onPickTeam={handlePick} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} highlightPath={highlightPath} intelSlotId={intelSlotId} onSelectForIntel={handleSelectForIntel} side="left" cardRefs={cardRefs} />
              <div className="flex items-center"><ConnectorGap /></div>
              <BracketColumn slots={leftSF} round="sf" picks={picks} onPickTeam={handlePick} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} highlightPath={highlightPath} intelSlotId={intelSlotId} onSelectForIntel={handleSelectForIntel} side="left" cardRefs={cardRefs} />

              <div className="flex items-center"><ConnectorGap /></div>

              {/* Final */}
              <BracketColumn slots={finalSlots} round="final" picks={picks} onPickTeam={handlePick} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} highlightPath={highlightPath} intelSlotId={intelSlotId} onSelectForIntel={handleSelectForIntel} side="left" cardRefs={cardRefs} />

              <div className="flex items-center"><ConnectorGap /></div>

              {/* Right side: SF → QF → R16 */}
              <BracketColumn slots={rightSF} round="sf" picks={picks} onPickTeam={handlePick} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} highlightPath={highlightPath} intelSlotId={intelSlotId} onSelectForIntel={handleSelectForIntel} side="right" cardRefs={cardRefs} />
              <div className="flex items-center"><ConnectorGap /></div>
              <BracketColumn slots={rightQF} round="qf" picks={picks} onPickTeam={handlePick} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} highlightPath={highlightPath} intelSlotId={intelSlotId} onSelectForIntel={handleSelectForIntel} side="right" cardRefs={cardRefs} />
              <div className="flex items-center"><ConnectorGap /></div>
              <BracketColumn slots={rightR16} round="r16" picks={picks} onPickTeam={handlePick} hoveredTeam={hoveredTeam} onHover={setHoveredTeam} highlightPath={highlightPath} intelSlotId={intelSlotId} onSelectForIntel={handleSelectForIntel} side="right" cardRefs={cardRefs} />
            </div>

            {/* SVG overlay for connector lines */}
            <SVGOverlay slots={slots} picks={picks} highlightPath={highlightPath} cardRefs={cardRefs} />
          </div>
        </div>

        {/* Intel panel */}
        <div className="hidden lg:block w-[320px] shrink-0">
          {intelSlot ? (
            <IntelPanel slot={intelSlot} picks={picks} onPick={handlePick} onClose={() => setIntelSlotId(null)} />
          ) : (
            <div className="h-full rounded-xl border border-border/30 bg-card/50 flex flex-col items-center justify-center p-6 text-center">
              <Swords className="h-10 w-10 text-muted-foreground/15 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground/40">Select a match</p>
              <p className="text-[10px] text-muted-foreground/30 mt-1">
                Click any matchup to view odds, stats, and make your pick
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile intel panel */}
      {intelSlot && (
        <div className="lg:hidden">
          <IntelPanel slot={intelSlot} picks={picks} onPick={handlePick} onClose={() => setIntelSlotId(null)} />
        </div>
      )}
    </div>
  );
}

function ConnectorGap() {
  return <div className="w-6 h-full relative flex items-center justify-center">
    <div className="h-full w-px bg-border/10" />
  </div>;
}

function SVGOverlay({
  slots,
  picks,
  highlightPath,
  cardRefs,
}: {
  slots: BracketSlot[];
  picks: Record<string, string>;
  highlightPath: Set<string>;
  cardRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}) {
  const [lines, setLines] = useState<ConnectorLine[]>([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function compute() {
      const container = containerRef.current?.parentElement;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const positions = new Map<string, { x: number; y: number; w: number; h: number }>();

      cardRefs.current.forEach((el, id) => {
        const r = el.getBoundingClientRect();
        positions.set(id, {
          x: r.left - cRect.left,
          y: r.top - cRect.top,
          w: r.width,
          h: r.height,
        });
      });

      const leftSlots = slots.filter((s) => {
        if (s.round === "final") return false;
        const idx = slots.filter((ss) => ss.round === s.round).indexOf(s);
        const count = slots.filter((ss) => ss.round === s.round).length;
        return idx < count / 2;
      });
      const rightSlots = slots.filter((s) => {
        if (s.round === "final") return false;
        const idx = slots.filter((ss) => ss.round === s.round).indexOf(s);
        const count = slots.filter((ss) => ss.round === s.round).length;
        return idx >= count / 2;
      });

      const allCompute = [
        ...computeConnectors(leftSlots, positions, "left", highlightPath),
        ...computeConnectors(rightSlots, positions, "right", highlightPath),
      ];

      setLines(allCompute);
      setDims({ w: cRect.width, h: cRect.height });
    }

    compute();
    const observer = new ResizeObserver(compute);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }
    return () => observer.disconnect();
  }, [slots, picks, highlightPath, cardRefs]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
      {dims.w > 0 && <BracketSVG lines={lines} width={dims.w} height={dims.h} />}
    </div>
  );
}
