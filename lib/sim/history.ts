export type HistoryPoint = {
  ts: number;
  sideAPct: number;
  line: number;
};

export class RingHistory {
  private readonly buf: HistoryPoint[];
  private cursor = 0;
  private size = 0;

  constructor(private readonly capacity: number) {
    this.buf = new Array<HistoryPoint>(capacity);
  }

  push(p: HistoryPoint) {
    this.buf[this.cursor] = p;
    this.cursor = (this.cursor + 1) % this.capacity;
    this.size = Math.min(this.capacity, this.size + 1);
  }

  latest(): HistoryPoint | null {
    if (this.size === 0) return null;
    const idx = (this.cursor - 1 + this.capacity) % this.capacity;
    return this.buf[idx] ?? null;
  }

  /**
   * Returns the newest point with `ts <= targetTs`.
   * Linear scan from newest is fast for small capacities.
   */
  atOrBefore(targetTs: number): HistoryPoint | null {
    if (this.size === 0) return null;
    for (let i = 0; i < this.size; i++) {
      const idx = (this.cursor - 1 - i + this.capacity * 4) % this.capacity;
      const p = this.buf[idx];
      if (!p) continue;
      if (p.ts <= targetTs) return p;
    }
    return null;
  }
}

