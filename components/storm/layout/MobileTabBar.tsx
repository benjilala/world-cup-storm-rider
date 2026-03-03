"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Trophy, Radio, Users, User } from "lucide-react";

const tabs = [
  { href: "/storm-the-cup", label: "HQ", icon: Zap },
  { href: "/storm-the-cup/bracket", label: "Bracket", icon: Trophy },
  { href: "/storm-the-cup/live", label: "Live", icon: Radio },
  { href: "/storm-the-cup/community", label: "Social", icon: Users },
  { href: "/storm-the-cup/u/BracketKing", label: "Profile", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 glass-surface">
      <div className="flex h-12 items-center justify-around">
        {tabs.map((tab) => {
          const basePath = tab.href.split("#")[0];
          const isActive =
            pathname === basePath ||
            (basePath !== "/storm-the-cup" && pathname.startsWith(basePath + "/"));

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? "text-storm-accent" : "text-muted-foreground"
              }`}
            >
              <tab.icon className={`h-4 w-4 ${tab.label === "Live" && isActive ? "animate-pulse" : ""}`} />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
