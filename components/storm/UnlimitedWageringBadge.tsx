import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UnlimitedWageringBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={`gap-1 ${className ?? ""}`}>
      <Zap className="h-3 w-3 text-storm-lightning" />
      <span className="text-[10px]">Unlimited Wagering</span>
    </Badge>
  );
}
