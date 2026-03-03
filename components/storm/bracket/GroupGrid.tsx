"use client";

import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBracketStore } from "@/store/bracketStore";
import { communityPredictions } from "@/lib/mock/storm";
import type { Group, Team } from "@/lib/types/storm";

function PredictionBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 flex-1 rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-storm-accent/60 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] font-mono text-muted-foreground w-7 text-right shrink-0">
        {pct}%
      </span>
    </div>
  );
}

function TeamEntry({
  team,
  qualifierLabel,
  prediction,
}: {
  team: Team;
  qualifierLabel?: "1st" | "2nd";
  prediction?: { qualifyPct: number; winGroupPct: number };
}) {
  return (
    <div className="rounded-lg bg-storm-surface px-3 py-2 transition-colors hover:bg-storm-surface-hover">
      <div className="flex items-center gap-3">
        <img
          src={team.flag}
          alt=""
          className="h-7 w-9 shrink-0 rounded object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{team.name}</p>
          {team.confederation && (
            <p className="text-[10px] text-muted-foreground">{team.confederation}</p>
          )}
        </div>
        {team.isHost && (
          <span className="shrink-0 rounded-full bg-storm-gold/10 px-2 py-0.5 text-[10px] font-medium text-storm-gold">
            Host
          </span>
        )}
        {qualifierLabel && (
          <span
            className={
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold " +
              (qualifierLabel === "1st"
                ? "bg-storm-gold/20 text-storm-gold ring-1 ring-storm-gold/30"
                : "bg-muted text-muted-foreground ring-1 ring-border/50")
            }
          >
            {qualifierLabel}
          </span>
        )}
      </div>
      {prediction && (
        <div className="mt-1.5 space-y-0.5">
          <PredictionBar pct={prediction.qualifyPct} label="qualify" />
        </div>
      )}
    </div>
  );
}

function AgreeBadge({ teamId, position }: { teamId: string; position: "1st" | "2nd" }) {
  const pred = communityPredictions[teamId];
  if (!pred) return null;
  const pct = position === "1st" ? pred.winGroupPct : Math.max(5, pred.qualifyPct - pred.winGroupPct);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-storm-accent">
      <Users className="h-3 w-3" />
      {pct}% agree
    </span>
  );
}

export function GroupGrid({
  groups,
  liveMode = false,
  selectedGroupId,
  onSelectGroup,
}: {
  groups: Group[];
  liveMode?: boolean;
  selectedGroupId?: string | null;
  onSelectGroup?: (groupId: string) => void;
}) {
  const { groupPicks, setGroupWinners } = useBracketStore();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {groups.map((group) => {
        const picks = groupPicks[group.id] ?? [];
        const firstId = picks[0] ?? "";
        const secondId = picks[1] ?? "";
        const secondOptions = group.teams.filter((t) => t.id !== firstId);
        const isSelected = selectedGroupId === group.id;

        const handleFirstChange = (teamId: string) => {
          const newSecond = teamId === secondId ? "" : secondId;
          setGroupWinners(group.id, teamId ? [teamId, newSecond].filter(Boolean) : []);
        };
        const handleSecondChange = (teamId: string) => {
          setGroupWinners(group.id, firstId ? [firstId, teamId].filter(Boolean) : teamId ? [teamId] : []);
        };

        return (
          <div
            key={group.id}
            className={
              "overflow-hidden rounded-xl border transition-all duration-200 " +
              (isSelected
                ? "border-storm-live/50 shadow-[0_0_16px_rgba(16,185,129,0.15)]"
                : "border-border/40 hover:border-border") +
              " bg-card" +
              (liveMode ? " cursor-pointer" : "")
            }
            onClick={() => onSelectGroup?.(group.id)}
          >
            <div className="flex items-center justify-between border-b border-border/30 bg-storm-surface px-4 py-2.5">
              <h3 className="text-sm font-bold tracking-wide">{group.name}</h3>
              <span className="text-[10px] text-muted-foreground">
                {picks.length}/2 picked
              </span>
            </div>
            <div className="space-y-1.5 p-2.5">
              {group.teams.map((team) => (
                <TeamEntry
                  key={team.id}
                  team={team}
                  qualifierLabel={
                    team.id === firstId ? "1st" : team.id === secondId ? "2nd" : undefined
                  }
                  prediction={communityPredictions[team.id]}
                />
              ))}
            </div>
            <div className="border-t border-border/30 bg-storm-surface/60 px-3 py-2.5">
              <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">
                Advance to knockout
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Select
                    value={firstId || "_none"}
                    onValueChange={(v) => handleFirstChange(v === "_none" ? "" : v)}
                  >
                    <SelectTrigger className="h-7 text-[11px] bg-storm-surface border-border/30" size="sm">
                      <SelectValue placeholder="1st" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">-- 1st --</SelectItem>
                      {group.teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.code} {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {firstId && <AgreeBadge teamId={firstId} position="1st" />}
                </div>
                <div className="space-y-1">
                  <Select
                    value={secondId || "_none"}
                    onValueChange={(v) => handleSecondChange(v === "_none" ? "" : v)}
                    disabled={!firstId}
                  >
                    <SelectTrigger className="h-7 text-[11px] bg-storm-surface border-border/30" size="sm">
                      <SelectValue placeholder="2nd" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">-- 2nd --</SelectItem>
                      {secondOptions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.code} {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {secondId && <AgreeBadge teamId={secondId} position="2nd" />}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
