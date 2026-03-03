import type {
  Team,
  Group,
  GroupStanding,
  Match,
  Round,
  StormRun,
  ExpertProfile,
  LeaderboardEntry,
  OddsHistoryPoint,
  ActivityEvent,
  ChatMessage,
  Market,
  Venue,
} from "@/lib/types/storm";
import { generate1X2, getMovementIndicator } from "@/lib/odds";
import type { OddsMovement } from "@/lib/odds";

const flag = (code: string) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

export const teams: Team[] = [
  { id: "bra", name: "Brazil", code: "BRA", flag: flag("br"), group: "A", fifaRanking: 1, confederation: "CONMEBOL" },
  { id: "ger", name: "Germany", code: "GER", flag: flag("de"), group: "A", fifaRanking: 4, confederation: "UEFA" },
  { id: "jpn", name: "Japan", code: "JPN", flag: flag("jp"), group: "A", fifaRanking: 18, confederation: "AFC" },
  { id: "nzl", name: "New Zealand", code: "NZL", flag: flag("nz"), group: "A", fifaRanking: 93, confederation: "OFC" },
  { id: "fra", name: "France", code: "FRA", flag: flag("fr"), group: "B", fifaRanking: 2, confederation: "UEFA" },
  { id: "eng", name: "England", code: "ENG", flag: flag("gb-eng"), group: "B", fifaRanking: 3, confederation: "UEFA" },
  { id: "kor", name: "South Korea", code: "KOR", flag: flag("kr"), group: "B", fifaRanking: 22, confederation: "AFC" },
  { id: "can", name: "Canada", code: "CAN", flag: flag("ca"), group: "B", fifaRanking: 40, confederation: "CONCACAF", isHost: true },
  { id: "arg", name: "Argentina", code: "ARG", flag: flag("ar"), group: "C", fifaRanking: 5, confederation: "CONMEBOL" },
  { id: "esp", name: "Spain", code: "ESP", flag: flag("es"), group: "C", fifaRanking: 6, confederation: "UEFA" },
  { id: "mex", name: "Mexico", code: "MEX", flag: flag("mx"), group: "C", fifaRanking: 15, confederation: "CONCACAF", isHost: true },
  { id: "aus", name: "Australia", code: "AUS", flag: flag("au"), group: "C", fifaRanking: 27, confederation: "AFC" },
  { id: "ned", name: "Netherlands", code: "NED", flag: flag("nl"), group: "D", fifaRanking: 7, confederation: "UEFA" },
  { id: "por", name: "Portugal", code: "POR", flag: flag("pt"), group: "D", fifaRanking: 8, confederation: "UEFA" },
  { id: "usa", name: "United States", code: "USA", flag: flag("us"), group: "D", fifaRanking: 11, confederation: "CONCACAF", isHost: true },
  { id: "uru", name: "Uruguay", code: "URU", flag: flag("uy"), group: "D", fifaRanking: 14, confederation: "CONMEBOL" },
  { id: "bel", name: "Belgium", code: "BEL", flag: flag("be"), group: "E", fifaRanking: 9, confederation: "UEFA" },
  { id: "cro", name: "Croatia", code: "CRO", flag: flag("hr"), group: "E", fifaRanking: 10, confederation: "UEFA" },
  { id: "mar", name: "Morocco", code: "MAR", flag: flag("ma"), group: "E", fifaRanking: 12, confederation: "CAF" },
  { id: "sen", name: "Senegal", code: "SEN", flag: flag("sn"), group: "E", fifaRanking: 21, confederation: "CAF" },
  { id: "den", name: "Denmark", code: "DEN", flag: flag("dk"), group: "F", fifaRanking: 13, confederation: "UEFA" },
  { id: "col", name: "Colombia", code: "COL", flag: flag("co"), group: "F", fifaRanking: 16, confederation: "CONMEBOL" },
  { id: "swi", name: "Switzerland", code: "SUI", flag: flag("ch"), group: "F", fifaRanking: 17, confederation: "UEFA" },
  { id: "ecu", name: "Ecuador", code: "ECU", flag: flag("ec"), group: "F", fifaRanking: 34, confederation: "CONMEBOL" },
  { id: "ser", name: "Serbia", code: "SRB", flag: flag("rs"), group: "G", fifaRanking: 25, confederation: "UEFA" },
  { id: "cam", name: "Cameroon", code: "CMR", flag: flag("cm"), group: "G", fifaRanking: 33, confederation: "CAF" },
  { id: "crc", name: "Costa Rica", code: "CRC", flag: flag("cr"), group: "G", fifaRanking: 48, confederation: "CONCACAF" },
  { id: "gha", name: "Ghana", code: "GHA", flag: flag("gh"), group: "G", fifaRanking: 60, confederation: "CAF" },
  { id: "pol", name: "Poland", code: "POL", flag: flag("pl"), group: "H", fifaRanking: 26, confederation: "UEFA" },
  { id: "par", name: "Paraguay", code: "PAR", flag: flag("py"), group: "H", fifaRanking: 38, confederation: "CONMEBOL" },
  { id: "irn", name: "Iran", code: "IRN", flag: flag("ir"), group: "H", fifaRanking: 20, confederation: "AFC" },
  { id: "nga", name: "Nigeria", code: "NGA", flag: flag("ng"), group: "H", fifaRanking: 28, confederation: "CAF" },
];

function makeStandings(groupTeams: Team[]): GroupStanding[] {
  return groupTeams.map((t, i) => ({
    teamId: t.id,
    played: 3,
    won: 3 - i,
    drawn: i === 1 ? 1 : 0,
    lost: i,
    gf: 6 - i,
    ga: i + 1,
    gd: 5 - 2 * i,
    points: (3 - i) * 3 + (i === 1 ? 1 : 0),
  }));
}

const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"];

export const groups: Group[] = groupNames.map((name) => {
  const groupTeams = teams.filter((t) => t.group === name);
  return {
    id: `group-${name.toLowerCase()}`,
    name: `Group ${name}`,
    teams: groupTeams,
    standings: makeStandings(groupTeams),
  };
});

/**
 * Mock community prediction data per team.
 * qualifyPct = % of users who predict this team to qualify (top 2).
 * winGroupPct = % of users who predict this team to win the group (1st).
 */
export const communityPredictions: Record<string, { qualifyPct: number; winGroupPct: number }> = (() => {
  const preds: Record<string, { qualifyPct: number; winGroupPct: number }> = {};
  for (const group of groups) {
    const sorted = [...group.teams].sort((a, b) => a.fifaRanking - b.fifaRanking);
    const weights = sorted.map((_, i) => Math.max(10, 95 - i * 22 - Math.floor(Math.random() * 8)));
    const total = weights.reduce((s, w) => s + w, 0);
    sorted.forEach((team, i) => {
      const qualifyPct = Math.min(97, Math.round((weights[i] / total) * 180));
      const winGroupPct = Math.min(85, Math.round((weights[i] / total) * 100));
      preds[team.id] = { qualifyPct, winGroupPct };
    });
  }
  return preds;
})();

function makeGroupMatches(group: Group): Match[] {
  const t = group.teams;
  const pairs: [number, number][] = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
  return pairs.map(([a, b], i) => ({
    id: `${group.id}-m${i + 1}`,
    stage: "groups" as const,
    group: group.name,
    homeTeamId: t[a].id,
    awayTeamId: t[b].id,
    homeScore: Math.floor(Math.random() * 4),
    awayScore: Math.floor(Math.random() * 3),
    status: i < 4 ? "finished" : i === 4 ? "live" : "upcoming",
    kickoff: new Date(2026, 5, 14 + i * 2, 18, 0).toISOString(),
    venue: ["MetLife Stadium", "Rose Bowl", "AT&T Stadium", "Hard Rock Stadium", "SoFi Stadium", "Azteca"][i % 6],
    crowdPickHome: 0.35 + Math.random() * 0.3,
    crowdPickDraw: 0.15 + Math.random() * 0.15,
    crowdPickAway: 0.2 + Math.random() * 0.25,
    crowdMoneyHome: 0.4 + Math.random() * 0.2,
    crowdMoneyDraw: 0.1 + Math.random() * 0.15,
    crowdMoneyAway: 0.2 + Math.random() * 0.2,
  }));
}

export const matches: Match[] = groups.flatMap(makeGroupMatches);

export const rounds: Round[] = [
  { stage: "groups", label: "Group Stage", matchIds: matches.filter((m) => m.stage === "groups").map((m) => m.id) },
  { stage: "r32", label: "Round of 32", matchIds: [] },
  { stage: "r16", label: "Round of 16", matchIds: [] },
  { stage: "qf", label: "Quarter-Finals", matchIds: [] },
  { stage: "sf", label: "Semi-Finals", matchIds: [] },
  { stage: "final", label: "Final", matchIds: [] },
];

const teamById = new Map(teams.map((t) => [t.id, t]));

export const markets: Market[] = matches.flatMap((m) => {
  const home = teamById.get(m.homeTeamId);
  const away = teamById.get(m.awayTeamId);
  const homeRank = home?.fifaRanking ?? 50;
  const awayRank = away?.fifaRanking ?? 50;
  const odds = generate1X2(homeRank, awayRank, m.id);

  return [
    {
      id: `mkt-1x2-${m.id}`,
      matchId: m.id,
      type: "1x2" as const,
      label: "Match Result",
      selections: [
        { id: `sel-h-${m.id}`, label: home?.code ?? "Home", odds: odds.home, movement: getMovementIndicator(m.id, "home") },
        { id: `sel-d-${m.id}`, label: "Draw", odds: odds.draw, movement: getMovementIndicator(m.id, "draw") },
        { id: `sel-a-${m.id}`, label: away?.code ?? "Away", odds: odds.away, movement: getMovementIndicator(m.id, "away") },
      ],
    },
    {
      id: `mkt-ou-${m.id}`,
      matchId: m.id,
      type: "over_under" as const,
      label: "Over/Under 2.5",
      selections: [
        { id: `sel-ov-${m.id}`, label: "Over 2.5", odds: Math.round((1.65 + (homeRank + awayRank) / 200) * 100) / 100, movement: getMovementIndicator(m.id, "home") },
        { id: `sel-un-${m.id}`, label: "Under 2.5", odds: Math.round((2.15 - (homeRank + awayRank) / 400) * 100) / 100, movement: getMovementIndicator(m.id, "away") },
      ],
    },
  ];
});

const marketsBy1X2 = new Map<string, { home: number; draw: number; away: number; homeMovement: OddsMovement; drawMovement: OddsMovement; awayMovement: OddsMovement }>();
for (const mkt of markets) {
  if (mkt.type !== "1x2") continue;
  const [h, d, a] = mkt.selections;
  marketsBy1X2.set(mkt.matchId, {
    home: h.odds, draw: d.odds, away: a.odds,
    homeMovement: h.movement, drawMovement: d.movement, awayMovement: a.movement,
  });
}

export function getMatchOdds(matchId: string) {
  return marketsBy1X2.get(matchId) ?? { home: 2.0, draw: 3.2, away: 3.5, homeMovement: "stable" as const, drawMovement: "stable" as const, awayMovement: "stable" as const };
}

export const users = [
  { id: "u1", username: "StormChaser99", avatar: "SC", balance: 5000 },
  { id: "u2", username: "BracketKing", avatar: "BK", balance: 12000 },
  { id: "u3", username: "VaultHunter", avatar: "VH", balance: 8500 },
  { id: "u4", username: "LightningRider", avatar: "LR", balance: 22000 },
  { id: "u5", username: "PerfectPicker", avatar: "PP", balance: 15000 },
];

export const runs: StormRun[] = [
  {
    id: "run-1",
    userId: "u2",
    username: "BracketKing",
    status: "active",
    currentStage: "r16",
    startingStake: 100,
    currentValue: 1600,
    vaultBalance: 450,
    vaultContributions: [
      { stage: "groups", amount: 150, timestamp: new Date(2026, 5, 20).toISOString() },
      { stage: "r32", amount: 300, timestamp: new Date(2026, 5, 28).toISOString() },
    ],
    stageResults: [
      { stage: "groups", picks: [], correct: 40, total: 48, isPerfect: false, decision: "ride", valueAtEnd: 400 },
      { stage: "r32", picks: [], correct: 14, total: 16, isPerfect: false, decision: "ride", valueAtEnd: 1600 },
    ],
    lightningMultipliers: [
      { stage: "groups", multiplier: 2, awarded: false },
      { stage: "r32", multiplier: 4, awarded: false },
    ],
    createdAt: new Date(2026, 5, 14).toISOString(),
  },
  {
    id: "run-2",
    userId: "u4",
    username: "LightningRider",
    status: "active",
    currentStage: "qf",
    startingStake: 250,
    currentValue: 8000,
    vaultBalance: 2200,
    vaultContributions: [
      { stage: "groups", amount: 500, timestamp: new Date(2026, 5, 20).toISOString() },
      { stage: "r32", amount: 700, timestamp: new Date(2026, 5, 28).toISOString() },
      { stage: "r16", amount: 1000, timestamp: new Date(2026, 6, 2).toISOString() },
    ],
    stageResults: [
      { stage: "groups", picks: [], correct: 48, total: 48, isPerfect: true, decision: "ride", valueAtEnd: 1000 },
      { stage: "r32", picks: [], correct: 16, total: 16, isPerfect: true, decision: "ride", valueAtEnd: 4000 },
      { stage: "r16", picks: [], correct: 8, total: 8, isPerfect: true, decision: "ride", valueAtEnd: 8000 },
    ],
    lightningMultipliers: [
      { stage: "groups", multiplier: 2, awarded: true },
      { stage: "r32", multiplier: 4, awarded: true },
      { stage: "r16", multiplier: 4, awarded: true },
    ],
    createdAt: new Date(2026, 5, 14).toISOString(),
  },
];

export const experts: ExpertProfile[] = [
  { userId: "u4", username: "LightningRider", avatar: "LR", title: "3x Perfect Stage", winRate: 0.78, roi: 3.2, streak: 14, followers: 2840, picks: [] },
  { userId: "u5", username: "PerfectPicker", avatar: "PP", title: "Group Stage Guru", winRate: 0.72, roi: 2.1, streak: 8, followers: 1950, picks: [] },
  { userId: "u2", username: "BracketKing", avatar: "BK", title: "Bracket Maestro", winRate: 0.68, roi: 1.8, streak: 6, followers: 3200, picks: [] },
];

export const stats = {
  totalRuns: 14523,
  activeRuns: 8741,
  totalVaulted: 2_340_000,
  perfectStages: 127,
  biggestPayout: 48_000,
  averageRunValue: 1850,
};

export const leaderboards: Record<string, LeaderboardEntry[]> = {
  roi: [
    { rank: 1, userId: "u4", username: "LightningRider", avatar: "LR", value: 3.2, label: "320% ROI" },
    { rank: 2, userId: "u5", username: "PerfectPicker", avatar: "PP", value: 2.1, label: "210% ROI" },
    { rank: 3, userId: "u2", username: "BracketKing", avatar: "BK", value: 1.8, label: "180% ROI" },
    { rank: 4, userId: "u1", username: "StormChaser99", avatar: "SC", value: 1.4, label: "140% ROI" },
    { rank: 5, userId: "u3", username: "VaultHunter", avatar: "VH", value: 1.1, label: "110% ROI" },
  ],
  streak: [
    { rank: 1, userId: "u4", username: "LightningRider", avatar: "LR", value: 14, label: "14 correct" },
    { rank: 2, userId: "u5", username: "PerfectPicker", avatar: "PP", value: 8, label: "8 correct" },
    { rank: 3, userId: "u2", username: "BracketKing", avatar: "BK", value: 6, label: "6 correct" },
  ],
  mostCopied: [
    { rank: 1, userId: "u2", username: "BracketKing", avatar: "BK", value: 342, label: "342 copies" },
    { rank: 2, userId: "u4", username: "LightningRider", avatar: "LR", value: 281, label: "281 copies" },
    { rank: 3, userId: "u5", username: "PerfectPicker", avatar: "PP", value: 198, label: "198 copies" },
  ],
};

export const oddsHistory: OddsHistoryPoint[] = (() => {
  const points: OddsHistoryPoint[] = [];
  const m = matches[0];
  if (!m) return points;
  for (let i = 0; i < 24; i++) {
    points.push({
      matchId: m.id,
      selectionId: `sel-h-${m.id}`,
      odds: 1.8 + Math.sin(i / 4) * 0.3,
      timestamp: new Date(2026, 5, 13, i).toISOString(),
    });
  }
  return points;
})();

export const activity: ActivityEvent[] = [
  { id: "ev1", type: "run_started", userId: "u1", username: "StormChaser99", description: "started a Storm Run with $500", timestamp: new Date(2026, 5, 20, 14, 30).toISOString() },
  { id: "ev2", type: "perfect_stage", userId: "u4", username: "LightningRider", description: "achieved a perfect Group Stage!", timestamp: new Date(2026, 5, 20, 15, 0).toISOString() },
  { id: "ev3", type: "vault_decision", userId: "u2", username: "BracketKing", description: "chose RIDE through Round of 32", timestamp: new Date(2026, 5, 28, 18, 0).toISOString() },
  { id: "ev4", type: "lightning_awarded", userId: "u4", username: "LightningRider", description: "earned 4x Lightning on R32!", timestamp: new Date(2026, 5, 28, 18, 30).toISOString(), meta: { multiplier: 4 } },
  { id: "ev5", type: "bet_placed", userId: "u3", username: "VaultHunter", description: "placed $200 on Brazil vs Germany", timestamp: new Date(2026, 5, 29, 10, 0).toISOString() },
  { id: "ev6", type: "stage_cleared", userId: "u5", username: "PerfectPicker", description: "cleared the Group Stage (42/48)", timestamp: new Date(2026, 5, 20, 16, 0).toISOString() },
];

export const chat: ChatMessage[] = [
  { id: "c1", matchId: matches[0]?.id ?? "", userId: "u1", username: "StormChaser99", text: "Brazil looking strong today!", timestamp: new Date(2026, 5, 14, 18, 5).toISOString() },
  { id: "c2", matchId: matches[0]?.id ?? "", userId: "u2", username: "BracketKing", text: "Germany's defense is shaky though", timestamp: new Date(2026, 5, 14, 18, 8).toISOString() },
  { id: "c3", matchId: matches[0]?.id ?? "", userId: "u3", username: "VaultHunter", text: "Over 2.5 seems like a lock", timestamp: new Date(2026, 5, 14, 18, 12).toISOString() },
  { id: "c4", matchId: matches[0]?.id ?? "", userId: "u4", username: "LightningRider", text: "My bracket has Brazil winning the whole thing", timestamp: new Date(2026, 5, 14, 18, 15).toISOString() },
];

export const venues: Venue[] = [
  { id: "metlife", name: "MetLife Stadium", city: "New York/NJ", country: "US", lat: 40.8128, lng: -74.0742, capacity: 82500 },
  { id: "rosebowl", name: "Rose Bowl", city: "Los Angeles", country: "US", lat: 34.1613, lng: -118.1676, capacity: 88432 },
  { id: "att", name: "AT&T Stadium", city: "Dallas", country: "US", lat: 32.7473, lng: -97.0945, capacity: 80000 },
  { id: "hardrock", name: "Hard Rock Stadium", city: "Miami", country: "US", lat: 25.958, lng: -80.2389, capacity: 64767 },
  { id: "sofi", name: "SoFi Stadium", city: "Los Angeles", country: "US", lat: 33.9535, lng: -118.3392, capacity: 70240 },
  { id: "mercedes", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "US", lat: 33.7554, lng: -84.4008, capacity: 71000 },
  { id: "nrg", name: "NRG Stadium", city: "Houston", country: "US", lat: 29.6847, lng: -95.4107, capacity: 72220 },
  { id: "lincoln", name: "Lincoln Financial Field", city: "Philadelphia", country: "US", lat: 39.9008, lng: -75.1674, capacity: 69176 },
  { id: "lumen", name: "Lumen Field", city: "Seattle", country: "US", lat: 47.5952, lng: -122.3316, capacity: 68740 },
  { id: "levis", name: "Levi's Stadium", city: "San Francisco", country: "US", lat: 37.4033, lng: -121.97, capacity: 68500 },
  { id: "arrowhead", name: "Arrowhead Stadium", city: "Kansas City", country: "US", lat: 39.0489, lng: -94.484, capacity: 76416 },
  { id: "gillette", name: "Gillette Stadium", city: "Boston", country: "US", lat: 42.0909, lng: -71.2643, capacity: 65878 },
  { id: "azteca", name: "Estadio Azteca", city: "Mexico City", country: "MX", lat: 19.3029, lng: -99.1505, capacity: 87523 },
  { id: "akron", name: "Estadio Akron", city: "Guadalajara", country: "MX", lat: 20.6809, lng: -103.4626, capacity: 49850 },
  { id: "bbva", name: "Estadio BBVA", city: "Monterrey", country: "MX", lat: 25.6703, lng: -100.2438, capacity: 53500 },
  { id: "bmo", name: "BMO Field", city: "Toronto", country: "CA", lat: 43.6332, lng: -79.4186, capacity: 45736 },
  { id: "bcplace", name: "BC Place", city: "Vancouver", country: "CA", lat: 49.2768, lng: -123.1117, capacity: 54500 },
];
