"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, ShoppingCart, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BalanceBadge } from "@/components/auth/BalanceBadge";
import { useAuthStore } from "@/store/authStore";
import { useBetSlipStore } from "@/store/betSlipStore";
import { useLiveStore } from "@/store/liveStore";
import { matches } from "@/lib/mock/storm";

const navTabs = [
  { href: "/storm-the-cup", label: "HQ", exact: true },
  { href: "/storm-the-cup/bracket", label: "Bracket" },
  { href: "/storm-the-cup/live", label: "Live" },
  { href: "/storm-the-cup/community", label: "Community" },
  { href: "/storm-the-cup/community?tab=leaderboards", label: "Leaderboards" },
];

export function TopBar() {
  const pathname = usePathname();
  const { isAuthenticated, openAuthDialog } = useAuthStore();
  const { selections, toggleSlip } = useBetSlipStore();
  const isLive = useLiveStore((s) => s.isLive);
  const hasLiveMatch = matches.some((m) => m.status === "live");

  return (
    <header className="shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-lg h-14 flex items-center px-4 gap-4">
      {/* Left: Wordmark + WC26 badge */}
      <Link href="/storm-the-cup" className="flex items-center gap-2 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-lightning/20">
          <Zap className="h-3.5 w-3.5 text-accent-lightning" />
        </div>
        <span className="text-sm font-bold tracking-wide hidden sm:inline">
          STORM THE CUP
        </span>
        <Badge className="bg-storm-accent/20 text-storm-accent text-[9px] px-1.5 py-0 h-4 hidden sm:flex">
          WC26
        </Badge>
      </Link>

      {/* Center: Navigation tabs (line variant) */}
      <nav className="flex-1 flex items-center justify-center">
        <div className="hidden md:flex items-center gap-1 rounded-none relative">
          {navTabs.map((tab) => {
            const basePath = tab.href.split("?")[0];
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname === basePath || pathname.startsWith(basePath + "/");

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  "relative px-3 py-1.5 text-xs font-medium transition-colors rounded-md " +
                  (isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-1.5 h-0.5 rounded-full bg-foreground" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Right: Wallet/Join + Now Live pill */}
      <div className="flex items-center gap-2 shrink-0">
        {hasLiveMatch && isLive && (
          <Link
            href="/storm-the-cup/live"
            className="flex items-center gap-1.5 rounded-full border border-storm-ride/30 bg-storm-ride/10 px-2.5 py-1 transition-colors hover:bg-storm-ride/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-storm-ride opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-storm-ride" />
            </span>
            <span className="text-[10px] font-semibold text-storm-ride">
              Now Live
            </span>
          </Link>
        )}

        {isAuthenticated ? (
          <>
            <BalanceBadge />
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8"
              onClick={toggleSlip}
            >
              <ShoppingCart className="h-4 w-4" />
              {selections.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-storm-ride text-[9px] text-white font-bold">
                  {selections.length}
                </span>
              )}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs bg-storm-accent hover:bg-storm-accent/90"
            onClick={() => openAuthDialog()}
          >
            <Zap className="h-3 w-3" />
            Join the Storm
          </Button>
        )}
      </div>
    </header>
  );
}
