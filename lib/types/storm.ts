export type StageKey =
  | "groups"
  | "r32"
  | "r16"
  | "qf"
  | "sf"
  | "final";

export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  group: string;
  fifaRanking: number;
  confederation?: string;
  isHost?: boolean;
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
  standings: GroupStanding[];
}

export interface GroupStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface Match {
  id: string;
  stage: StageKey;
  group?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: "upcoming" | "live" | "finished";
  kickoff: string;
  venue: string;
  crowdPickHome: number;
  crowdPickDraw: number;
  crowdPickAway: number;
  crowdMoneyHome: number;
  crowdMoneyDraw: number;
  crowdMoneyAway: number;
}

export interface Round {
  stage: StageKey;
  label: string;
  matchIds: string[];
}

export interface Market {
  id: string;
  matchId: string;
  type: "1x2" | "over_under" | "btts" | "correct_score" | "anytime_scorer";
  label: string;
  selections: MarketSelection[];
}

export interface MarketSelection {
  id: string;
  label: string;
  odds: number;
  movement: "up" | "down" | "stable";
}

export interface Wager {
  id: string;
  userId: string;
  marketId: string;
  selectionId: string;
  stake: number;
  odds: number;
  status: "open" | "won" | "lost" | "void";
  createdAt: string;
}

export interface BracketPick {
  matchId: string;
  winnerId: string;
  score?: string;
}

export interface StormRun {
  id: string;
  userId: string;
  username: string;
  status: "active" | "completed" | "busted";
  currentStage: StageKey;
  startingStake: number;
  currentValue: number;
  vaultBalance: number;
  vaultContributions: VaultContribution[];
  stageResults: StageResult[];
  lightningMultipliers: LightningMultiplier[];
  createdAt: string;
}

export interface StageResult {
  stage: StageKey;
  picks: BracketPick[];
  correct: number;
  total: number;
  isPerfect: boolean;
  decision: "ride" | "vault" | null;
  valueAtEnd: number;
}

export interface VaultContribution {
  stage: StageKey;
  amount: number;
  timestamp: string;
}

export interface LightningMultiplier {
  stage: StageKey;
  multiplier: number;
  awarded: boolean;
}

export interface VaultState {
  balance: number;
  contributions: VaultContribution[];
  isLocked: boolean;
  hasUnlocked: boolean;
  finalUnlockWager: FinalUnlockWager | null;
}

export interface FinalUnlockWager {
  type: "secure" | "storm_all_in" | "storm_plus";
  amount: number;
  boostApplied: boolean;
}

export interface Boost {
  id: string;
  type: "odds_boost" | "vault_shield" | "lightning_charge";
  label: string;
  description: string;
  used: boolean;
}

export interface OddsHistoryPoint {
  matchId: string;
  selectionId: string;
  odds: number;
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  type: "bet_placed" | "run_started" | "stage_cleared" | "vault_decision" | "lightning_awarded" | "perfect_stage";
  userId: string;
  username: string;
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface ExpertProfile {
  userId: string;
  username: string;
  avatar: string;
  title: string;
  winRate: number;
  roi: number;
  streak: number;
  followers: number;
  picks: BracketPick[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  value: number;
  label: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: "US" | "MX" | "CA";
  lat: number;
  lng: number;
  capacity: number;
}
