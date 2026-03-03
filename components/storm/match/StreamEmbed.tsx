import { Card, CardContent } from "@/components/ui/card";
import { MonitorPlay } from "lucide-react";

export function StreamEmbed() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex aspect-video items-center justify-center bg-muted/50">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <MonitorPlay className="h-10 w-10" />
            <p className="text-sm">Live Stream</p>
            <p className="text-xs">Coverage begins at kickoff</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
