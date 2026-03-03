export function decayFactor(dtMs: number, halfLifeMs: number) {
  if (!(halfLifeMs > 0)) return 0;
  if (!(dtMs > 0)) return 1;
  return Math.pow(0.5, dtMs / halfLifeMs);
}

export function applyDecay(value: number, dtMs: number, halfLifeMs: number) {
  return value * decayFactor(dtMs, halfLifeMs);
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function clamp01(n: number) {
  return clamp(n, 0, 1);
}

