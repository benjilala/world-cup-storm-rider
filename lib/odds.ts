/**
 * Deterministic 1X2 odds generator based on FIFA rankings.
 *
 * Uses ranking gap to derive implied probabilities, then converts to
 * decimal odds with a built-in margin (~8%). A simple string hash
 * ensures the same match always produces the same odds.
 */

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface MatchOdds1X2 {
  home: number;
  draw: number;
  away: number;
}

/**
 * Generate stable 1X2 decimal odds for a match given both teams' FIFA rankings.
 * Lower rank = stronger team = lower odds.
 */
export function generate1X2(
  homeRank: number,
  awayRank: number,
  matchId: string,
): MatchOdds1X2 {
  const seed = hashCode(matchId);
  const noise = (seededRandom(seed) - 0.5) * 0.06;

  const homeStrength = 1 / (homeRank + 5);
  const awayStrength = 1 / (awayRank + 5);
  const total = homeStrength + awayStrength;

  let homeProb = (homeStrength / total) * 0.82 + 0.04 + noise;
  let awayProb = (awayStrength / total) * 0.82 + 0.04 - noise;
  let drawProb = 1 - homeProb - awayProb;

  homeProb = Math.max(0.08, Math.min(0.85, homeProb));
  awayProb = Math.max(0.08, Math.min(0.85, awayProb));
  drawProb = Math.max(0.10, Math.min(0.38, drawProb));

  const sum = homeProb + drawProb + awayProb;
  homeProb /= sum;
  drawProb /= sum;
  awayProb /= sum;

  const margin = 1.08;

  return {
    home: round2(margin / homeProb),
    draw: round2(margin / drawProb),
    away: round2(margin / awayProb),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export type OddsMovement = "up" | "down" | "stable";

/**
 * Cosmetic movement indicator — deterministic from matchId + side.
 * ~30% up, ~30% down, ~40% stable.
 */
export function getMovementIndicator(
  matchId: string,
  side: "home" | "draw" | "away",
): OddsMovement {
  const h = hashCode(matchId + side) % 100;
  if (h < 30) return "up";
  if (h < 60) return "down";
  return "stable";
}
