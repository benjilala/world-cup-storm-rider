"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Zap, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { useVaultStore } from "@/store/vaultStore";
import { useStormRunStore } from "@/store/stormRunStore";
import { VAULT_UNLOCK_OPTIONS } from "@/config/storm";
import { RiskCopyCallout } from "@/components/storm/RiskCopyCallout";
import type { FinalUnlockWager } from "@/lib/types/storm";

export default function VaultChamberPage() {
  const { vaultBalance, unlockVault, finalUnlockWager, hasUnlockedVault } = useVaultStore();
  const { currentRun } = useStormRunStore();
  const [selected, setSelected] = useState<FinalUnlockWager["type"] | null>(null);

  const handleUnlock = () => {
    if (!selected) return;
    const opt = VAULT_UNLOCK_OPTIONS[selected];
    unlockVault({
      type: selected,
      amount: vaultBalance * opt.riskMultiplier,
      boostApplied: selected === "storm_plus",
    });
  };

  if (hasUnlockedVault && finalUnlockWager) {
    return (
      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <div className="text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-storm-perfect mx-auto" />
          <h1 className="text-2xl font-bold">Vault Unlocked</h1>
          <p className="text-muted-foreground">
            You chose <strong>{VAULT_UNLOCK_OPTIONS[finalUnlockWager.type].label}</strong>
          </p>
          <p className="text-3xl font-bold font-mono">
            ${finalUnlockWager.amount.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-storm-vault/10">
            <Lock className="h-7 w-7 text-storm-vault" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Vault Chamber</h1>
        <p className="text-sm text-muted-foreground">
          Choose how to unlock your <strong className="text-foreground">${vaultBalance.toLocaleString()}</strong> vault balance.
        </p>
      </div>

      <RiskCopyCallout variant="unlock" />

      <div className="grid gap-3">
        {(Object.entries(VAULT_UNLOCK_OPTIONS) as [FinalUnlockWager["type"], typeof VAULT_UNLOCK_OPTIONS.secure][]).map(
          ([key, opt]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-colors ${
                selected === key ? "border-storm-accent bg-storm-muted/20" : "hover:border-storm-accent/30"
              }`}
              onClick={() => setSelected(key)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  key === "secure"
                    ? "bg-storm-vault/10"
                    : key === "storm_all_in"
                      ? "bg-storm-ride/10"
                      : "bg-storm-lightning/10"
                }`}>
                  {key === "secure" ? (
                    <Shield className="h-5 w-5 text-storm-vault" />
                  ) : key === "storm_all_in" ? (
                    <AlertTriangle className="h-5 w-5 text-storm-ride" />
                  ) : (
                    <Zap className="h-5 w-5 text-storm-lightning" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold">
                    ${(vaultBalance * opt.riskMultiplier).toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {opt.riskMultiplier}x
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!selected}
        onClick={handleUnlock}
      >
        {selected
          ? `Unlock — ${VAULT_UNLOCK_OPTIONS[selected].label}`
          : "Choose an option above"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        No hidden fees. No dark patterns. Your choice is final and transparent.
      </p>
    </div>
  );
}
