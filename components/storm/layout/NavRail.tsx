"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Trophy, Radio, Users, User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const items = [
  { href: "/storm-the-cup", label: "HQ", icon: Zap },
  { href: "/storm-the-cup/bracket", label: "Bracket", icon: Trophy },
  { href: "/storm-the-cup/live", label: "Live", icon: Radio },
  { href: "/storm-the-cup/community", label: "Community", icon: Users },
  { href: "/storm-the-cup/u/BracketKing", label: "Profile", icon: User },
];

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border/50 bg-storm-surface py-4">
      <Link
        href="/storm-the-cup"
        className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-storm-accent text-storm-accent-foreground"
      >
        <Zap className="h-4 w-4" />
      </Link>

      {items.map((item) => {
        const basePath = item.href.split("#")[0];
        const isActive =
          pathname === basePath ||
          (basePath !== "/storm-the-cup" && pathname.startsWith(basePath + "/"));

        return (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-storm-accent/20 text-storm-accent shadow-[0_0_12px_2px] shadow-storm-accent/20"
                    : "text-muted-foreground hover:bg-storm-surface-hover hover:text-foreground"
                }`}
              >
                <item.icon className={`h-5 w-5 ${item.label === "Live" && isActive ? "animate-pulse" : ""}`} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
