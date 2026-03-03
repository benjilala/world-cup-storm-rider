"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Unlock } from "lucide-react";
import { useVaultStore } from "@/store/vaultStore";

export function VaultBalanceCard() {
  const { vaultBalance, isVaultLocked, vaultContributions } = useVaultStore();

  return (
    <Card className="border-storm-vault/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-storm-vault" />
          Vault
        </CardTitle>
        {isVaultLocked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Unlock className="h-4 w-4 text-storm-perfect" />
        )}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold font-mono">${vaultBalance.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {vaultContributions.length} contributions
        </p>
        {isVaultLocked && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Locked until final stage or vault chamber unlock
          </p>
        )}
      </CardContent>
    </Card>
  );
}
