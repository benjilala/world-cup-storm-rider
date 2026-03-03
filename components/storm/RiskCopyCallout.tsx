import { Shield, AlertTriangle } from "lucide-react";

interface RiskCopyCalloutProps {
  variant: "vault" | "ride" | "unlock";
  className?: string;
}

const COPY = {
  vault: {
    icon: Shield,
    title: "Vault Your Winnings",
    description: "Lock a portion of your current value into the vault. Protected regardless of what happens next.",
    color: "text-storm-vault",
  },
  ride: {
    icon: AlertTriangle,
    title: "Ride the Storm",
    description: "Keep your full balance active. Higher risk, higher potential reward. Lightning multipliers only apply when you Ride.",
    color: "text-storm-ride",
  },
  unlock: {
    icon: Shield,
    title: "Vault Chamber",
    description: "Choose how to unlock your vaulted winnings. Secure locks it in. Storm All-In risks it for double. No hidden fees, no dark patterns.",
    color: "text-storm-accent",
  },
};

export function RiskCopyCallout({ variant, className }: RiskCopyCalloutProps) {
  const cfg = COPY[variant];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-lg border bg-muted/30 p-3 ${className ?? ""}`}>
      <div className="flex items-start gap-2">
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
        <div>
          <p className="text-sm font-medium">{cfg.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
        </div>
      </div>
    </div>
  );
}
