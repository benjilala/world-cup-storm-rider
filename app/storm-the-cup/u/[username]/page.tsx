"use client";

import { use } from "react";
import { ProfileHeader } from "@/components/storm/social/ProfileHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runs, users } from "@/lib/mock/storm";
import { STAGE_LABELS } from "@/config/storm";
import { Zap, Shield, Trophy, TrendingUp, Target, BarChart3 } from "lucide-react";
import Link from "next/link";

function StatCard({ icon: Icon, label, value, accent }: {
  icon: typeof Zap;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="glass-panel rounded-xl px-4 py-3 text-center">
      <Icon className={`h-4 w-4 mx-auto mb-1 ${accent}`} />
      <p className="text-lg font-mono font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  const userRuns = runs.filter((r) => r.username.toLowerCase() === username.toLowerCase());

  const completedRuns = userRuns.filter((r) => r.status === "completed");
  const totalVaulted = userRuns.reduce((sum, r) => sum + r.vaultBalance, 0);
  const bestRun = userRuns.reduce(
    (best, r) => (r.currentValue > (best?.currentValue ?? 0) ? r : best),
    userRuns[0],
  );
  const lightningCount = userRuns.reduce(
    (sum, r) => sum + r.stageResults.filter((sr) => sr.isPerfect).length,
    0,
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
      <ProfileHeader
        userId={user?.id ?? "unknown"}
        username={username}
        avatar={user?.avatar ?? username.slice(0, 2).toUpperCase()}
        runCount={userRuns.length}
        followers={142}
        following={38}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={BarChart3}
          label="Win Rate"
          value={completedRuns.length > 0
            ? `${Math.round((completedRuns.length / userRuns.length) * 100)}%`
            : "—"
          }
          accent="text-storm-accent"
        />
        <StatCard
          icon={Shield}
          label="Total Vaulted"
          value={`$${totalVaulted.toLocaleString()}`}
          accent="text-storm-vault"
        />
        <StatCard
          icon={TrendingUp}
          label="Best Run"
          value={bestRun ? `$${bestRun.currentValue.toLocaleString()}` : "—"}
          accent="text-storm-gold"
        />
        <StatCard
          icon={Zap}
          label="Lightning"
          value={`${lightningCount}x`}
          accent="text-storm-lightning"
        />
      </div>

      <Tabs defaultValue="runs">
        <TabsList className="bg-storm-surface">
          <TabsTrigger value="runs" className="text-xs">Storm Runs</TabsTrigger>
          <TabsTrigger value="bracket" className="text-xs">Bracket</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="mt-4 space-y-3">
          {userRuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Target className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No runs yet.</p>
            </div>
          ) : (
            userRuns.map((run) => (
              <Link key={run.id} href={`/storm-the-cup/run/${run.id}`}>
                <Card className="hover:border-storm-accent/30 transition-all hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      run.status === "active"
                        ? "bg-storm-gold/10"
                        : run.status === "completed"
                          ? "bg-storm-live/10"
                          : "bg-muted"
                    }`}>
                      <Zap className={`h-5 w-5 ${
                        run.status === "active"
                          ? "text-storm-gold"
                          : run.status === "completed"
                            ? "text-storm-live"
                            : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Storm Run #{run.id.split("-")[1]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {STAGE_LABELS[run.currentStage]} ·{" "}
                        <span className={
                          run.status === "active"
                            ? "text-storm-gold"
                            : run.status === "completed"
                              ? "text-storm-live"
                              : "text-storm-ride"
                        }>
                          {run.status}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">
                        ${run.currentValue.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        <Shield className="h-3 w-3 text-storm-vault" />
                        <span className="text-[10px] text-muted-foreground">
                          ${run.vaultBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {run.stageResults.some((sr) => sr.isPerfect) && (
                      <Badge className="bg-storm-lightning/20 text-storm-lightning text-[9px]">
                        <Zap className="h-2.5 w-2.5 mr-0.5" />
                        {run.stageResults.filter((sr) => sr.isPerfect).length}x
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="bracket" className="mt-4">
          <Card className="border-border/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Bracket Snapshot</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card className="border-border/30">
            <CardContent className="space-y-3 p-4 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-storm-surface px-4 py-3">
                <span>Hide stake amounts</span>
                <Badge variant="outline" className="text-[10px]">Off</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-storm-surface px-4 py-3">
                <span>Delayed reveal</span>
                <Badge variant="outline" className="text-[10px]">Off</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
