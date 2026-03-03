import { NavRail } from "@/components/storm/layout/NavRail";
import { TopBar } from "@/components/storm/layout/TopBar";
import { RunBar } from "@/components/storm/layout/RunBar";
import { ParlayTracker } from "@/components/storm/layout/ParlayTracker";
import { MobileTabBar } from "@/components/storm/layout/MobileTabBar";
import { BetSlipSheet } from "@/components/storm/layout/BetSlipSheet";
import { FollowersSheet } from "@/components/storm/layout/FollowersSheet";
import { StormProviders } from "@/components/storm/StormProviders";
import { CheckpointOverlay } from "@/components/storm/CheckpointOverlay";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: "Storm the Cup — 2026 World Cup",
  description:
    "Unlimited wagering. No minimum. No maximum. Build your bracket, start Storm Runs, and compete with the community.",
};

export default function StormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <StormProviders>
        <div className="dark bg-storm storm-texture relative flex h-dvh flex-col">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <NavRail />
            <main className="flex-1 overflow-y-auto pb-28 md:pb-16">
              {children}
            </main>
          </div>
          <MobileTabBar />
          <ParlayTracker />
          <RunBar />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex justify-center pb-16 md:pb-2">
            <div className="rounded-full border border-white/8 bg-black/30 px-3 py-0.5 text-[10px] font-medium tracking-wide text-white/50 backdrop-blur">
              SIMULATION — NOT REAL WAGER DATA
            </div>
          </div>
        </div>
        <BetSlipSheet />
        <FollowersSheet />
        <CheckpointOverlay />
        <AuthDialog />
      </StormProviders>
    </TooltipProvider>
  );
}
