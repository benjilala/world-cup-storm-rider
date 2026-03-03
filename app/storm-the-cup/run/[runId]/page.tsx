"use client";

import { use, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Shield, TrendingUp, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { StormMeterCard } from "@/components/storm/meter/StormMeterCard";
import { VaultBalanceCard } from "@/components/storm/meter/VaultBalanceCard";
import { RiskCopyCallout } from "@/components/storm/RiskCopyCallout";
import { AuthGate } from "@/components/auth/AuthGate";
import { useStormRunStore } from "@/store/stormRunStore";
import { useVaultStore } from "@/store/vaultStore";
import { runs as mockRuns } from "@/lib/mock/storm";
import { STAGE_ORDER, STAGE_LABELS, LIGHTNING_MULTIPLIERS } from "@/config/storm";
import Link from "next/link";

export default function RunPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = use(params);
  const { currentRun, setRun, makeDecision, awardLightning } = useStormRunStore();
  const { vaultBalance } = useVaultStore();

  useEffect(() => {
    const mock = mockRuns.find((r) => r.id === runId);
    if (mock && !currentRun) {
      setRun(mock);
    }
  }, [runId, currentRun, setRun]);

  const run = currentRun;

  if (!run) {
    return (
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Storm Run</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <Zap className="h-10 w-10 text-storm-lightning" />
            <p className="text-muted-foreground text-center">
              Start a Storm Run to ride through the tournament stages.
            </p>
            <AuthGate intent={{ type: "start_run", stake: 100 }}>
              <Button size="lg" className="gap-2">
                <Zap className="h-4 w-4" />
                Start Storm Run — $100
              </Button>
            </AuthGate>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-storm-lightning" />
            Storm Run
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            <Link href={`/storm-the-cup/u/${run.username}`} className="hover:underline">
              {run.username}
            </Link>{" "}
            · Started with ${run.startingStake}
          </p>
        </div>
        <Badge
          className={
            run.status === "active"
              ? "bg-storm-perfect text-storm-vault-foreground"
              : run.status === "busted"
                ? "bg-destructive"
                : "bg-storm-vault text-storm-vault-foreground"
          }
        >
          {run.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StormMeterCard run={run} />
        <VaultBalanceCard />
      </div>

      {/* Stage Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Stage Progression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {STAGE_ORDER.map((stage, idx) => {
            const result = run.stageResults.find((r) => r.stage === stage);
            const isCurrent = run.currentStage === stage;
            const lightning = run.lightningMultipliers.find((lm) => lm.stage === stage);
            const isComplete = !!result;

            return (
              <div key={stage}>
                <div
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    isCurrent ? "border-storm-accent bg-storm-muted/20" : ""
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    isComplete
                      ? "bg-storm-perfect/20 text-storm-perfect"
                      : isCurrent
                        ? "bg-storm-accent/20 text-storm-accent"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{STAGE_LABELS[stage]}</p>
                    {result && (
                      <p className="text-xs text-muted-foreground">
                        {result.correct}/{result.total} correct
                        {result.isPerfect && (
                          <Badge variant="outline" className="ml-1.5 text-[10px] text-storm-perfect">
                            PERFECT
                          </Badge>
                        )}
                      </p>
                    )}
                  </div>

                  {lightning && (
                    <Badge
                      variant={lightning.awarded ? "default" : "outline"}
                      className={`text-[10px] gap-0.5 ${lightning.awarded ? "bg-storm-lightning text-storm-lightning-foreground" : ""}`}
                    >
                      <Zap className="h-3 w-3" />
                      {LIGHTNING_MULTIPLIERS[stage]}x
                    </Badge>
                  )}

                  {result?.decision && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        result.decision === "vault" ? "text-storm-vault" : "text-storm-ride"
                      }`}
                    >
                      {result.decision === "vault" ? (
                        <><Shield className="h-3 w-3 mr-0.5" /> VAULT</>
                      ) : (
                        <><Zap className="h-3 w-3 mr-0.5" /> RIDE</>
                      )}
                    </Badge>
                  )}

                  {isCurrent && !result?.decision && result && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1 text-storm-vault"
                        onClick={() => makeDecision(stage, "vault")}
                      >
                        <Shield className="h-3 w-3" />
                        Vault
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs gap-1 bg-storm-ride text-storm-ride-foreground"
                        onClick={() => {
                          makeDecision(stage, "ride");
                          if (result.isPerfect) {
                            awardLightning(stage);
                          }
                        }}
                      >
                        <Zap className="h-3 w-3" />
                        Ride
                      </Button>
                    </div>
                  )}
                </div>
                {idx < STAGE_ORDER.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="h-4 w-px bg-border" />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Decision helpers */}
      <div className="grid gap-3 sm:grid-cols-2">
        <RiskCopyCallout variant="vault" />
        <RiskCopyCallout variant="ride" />
      </div>

      {run.status === "active" && run.currentStage === "final" && (
        <Card className="border-storm-accent">
          <CardContent className="p-4 text-center space-y-3">
            <h3 className="text-lg font-bold">Vault Chamber Available</h3>
            <p className="text-sm text-muted-foreground">
              Choose how to unlock your vaulted winnings.
            </p>
            <Button asChild className="gap-2">
              <Link href="/storm-the-cup/vault/chamber">
                Enter Vault Chamber
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
