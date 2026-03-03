export type SwingSignals = {
  sideAPct_60sAgo: number;
  swing60s: number;
  didSwing: boolean;
  didFlip: boolean;
};

export function computeSwingSignals(args: {
  nowMs: number;
  sideAPct: number;
  sideAPct_60sAgo: number;
  prevSideAPct: number;
  lastSwingTs: number;
  lastFlipTs: number;
}): SwingSignals & { nextLastSwingTs: number; nextLastFlipTs: number } {
  const delta = args.sideAPct - args.sideAPct_60sAgo;
  const didSwing = Math.abs(delta) >= 0.04 && args.nowMs - args.lastSwingTs > 6_000;

  const crossed =
    (args.prevSideAPct < 0.5 && args.sideAPct >= 0.5) ||
    (args.prevSideAPct > 0.5 && args.sideAPct <= 0.5);
  const didFlip = crossed && args.nowMs - args.lastFlipTs > 10_000;

  return {
    sideAPct_60sAgo: args.sideAPct_60sAgo,
    swing60s: delta,
    didSwing,
    didFlip,
    nextLastSwingTs: didSwing ? args.nowMs : args.lastSwingTs,
    nextLastFlipTs: didFlip ? args.nowMs : args.lastFlipTs,
  };
}

