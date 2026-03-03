"use client";

import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSimStore } from "@/store/useSimStore";

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${Math.round(n)}`;
}

type SortKey = "heat" | "handle" | "bpm" | "line" | "aPct";

export function HotEventsPanel() {
  const eventCatalog = useSimStore((s) => s.eventCatalog);
  const markets = useSimStore((s) => s.markets);

  const [sport, setSport] = useState<string>("All");
  const [country, setCountry] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("heat");
  const [desc, setDesc] = useState(true);

  const sports = useMemo(() => {
    const set = new Set(eventCatalog.map((e) => e.sport));
    return ["All", ...Array.from(set)];
  }, [eventCatalog]);

  const countries = useMemo(() => {
    const set = new Set(eventCatalog.map((e) => e.country));
    return ["All", ...Array.from(set)];
  }, [eventCatalog]);

  const rows = useMemo(() => {
    const filtered = eventCatalog
      .filter((e) => (sport === "All" ? true : e.sport === sport))
      .filter((e) => (country === "All" ? true : e.country === country))
      .map((e) => {
        const m = markets[e.id];
        return {
          id: e.id,
          eventName: e.eventName,
          league: e.league,
          sport: e.sport,
          country: e.country,
          heat: m?.heatScore ?? 0,
          handle: m?.totalHandle5m ?? 0,
          bpm: m?.betsPerMin ?? 0,
          line: m?.line ?? 0.5,
          aPct: m?.sideAPct ?? 0.5,
        };
      });

    const mult = desc ? -1 : 1;
    const val = (r: (typeof filtered)[number]) => {
      switch (sortKey) {
        case "handle":
          return r.handle;
        case "bpm":
          return r.bpm;
        case "line":
          return r.line;
        case "aPct":
          return r.aPct;
        case "heat":
        default:
          return r.heat;
      }
    };

    return filtered.sort((a, b) => (val(a) - val(b)) * mult);
  }, [country, desc, eventCatalog, markets, sortKey, sport]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setDesc((d) => !d);
    else {
      setSortKey(k);
      setDesc(true);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="border-white/10 bg-black/35">
        <CardContent className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger className="h-9 border-white/10 bg-black/30 text-[12px]">
              <SelectValue placeholder="Sport" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-black/90 text-white">
              {sports.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "All" ? "All Sports" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-9 border-white/10 bg-black/30 text-[12px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-black/90 text-white">
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "All" ? "All Regions" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/35">
        <Table className="text-[12px]">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="h-9 text-white/50">EVENT</TableHead>
              <TableHead className="h-9 cursor-pointer text-right text-white/50" onClick={() => toggleSort("heat")}>
                HEAT
              </TableHead>
              <TableHead className="h-9 cursor-pointer text-right text-white/50" onClick={() => toggleSort("handle")}>
                LIQ (5M)
              </TableHead>
              <TableHead className="h-9 cursor-pointer text-right text-white/50" onClick={() => toggleSort("bpm")}>
                BPM
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 40).map((r) => (
              <TableRow key={r.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="py-2 font-medium text-white/85">
                  <div className="truncate">{r.eventName}</div>
                  <div className="truncate text-[10px] text-white/45">
                    {r.league} · {r.country}
                  </div>
                </TableCell>
                <TableCell className="py-2 text-right font-mono tabular-nums text-white/75">
                  {(r.heat * 100).toFixed(0)}
                </TableCell>
                <TableCell className="py-2 text-right font-mono tabular-nums text-white/75">
                  {fmtMoney(r.handle)}
                </TableCell>
                <TableCell className="py-2 text-right font-mono tabular-nums text-white/75">
                  {Math.round(r.bpm)}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={4} className="py-4 text-center text-white/45">
                  No events match filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

