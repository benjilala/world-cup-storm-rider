import type { Match } from "@/lib/types/storm";

export function CrowdBars({ match }: { match: Match }) {
  const total = match.crowdPickHome + match.crowdPickDraw + match.crowdPickAway;
  const homePct = total > 0 ? (match.crowdPickHome / total) * 100 : 33;
  const drawPct = total > 0 ? (match.crowdPickDraw / total) * 100 : 34;
  const awayPct = total > 0 ? (match.crowdPickAway / total) * 100 : 33;

  return (
    <div className="space-y-1">
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
        <div
          className="bg-storm-accent transition-all"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="bg-muted-foreground/30 transition-all"
          style={{ width: `${drawPct}%` }}
        />
        <div
          className="bg-storm-ride transition-all"
          style={{ width: `${awayPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{homePct.toFixed(0)}%</span>
        <span className="text-center">{drawPct.toFixed(0)}%</span>
        <span>{awayPct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
