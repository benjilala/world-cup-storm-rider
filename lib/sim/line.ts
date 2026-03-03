import { clamp } from "./decay";

export type BetSide = "A" | "B";
export type BetKind = "normal" | "sharp" | "spike" | "whale";

export type LineBehavior = {
  min: number;
  max: number;
  stakeImpactBase: number;
  stakeImpactMax: number;
  liquidityBase: number;
  liquiditySlope: number;
  sharpMultiplier: number;
  whaleMultiplier: number;
  meanReversion: number;
  noise: number;
};

export function updateLineOnBet(args: {
  rand: () => number;
  line: number;
  sideAPct: number;
  side: BetSide;
  stake: number;
  kind: BetKind;
  totalHandle5m: number;
  behavior: LineBehavior;
  noiseMult: number;
}) {
  const b = args.behavior;
  const sideSign = args.side === "A" ? 1 : -1;

  const liquidity = Math.max(1, b.liquidityBase + args.totalHandle5m);
  const scaled = Math.pow(args.stake / liquidity, b.liquiditySlope);
  const bounded = Math.min(b.stakeImpactMax, b.stakeImpactBase * scaled);

  const kindMult =
    args.kind === "whale" ? b.whaleMultiplier : args.kind === "sharp" ? b.sharpMultiplier : 1;

  const impact = sideSign * bounded * kindMult;
  const meanRevert = (args.sideAPct - args.line) * b.meanReversion;
  const noise = (args.rand() - 0.5) * b.noise * args.noiseMult * (args.kind === "sharp" ? 1.2 : 1);

  const next = args.line + impact + meanRevert + noise;
  return clamp(next, b.min, b.max);
}

