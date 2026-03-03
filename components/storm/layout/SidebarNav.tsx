"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Trophy,
  Zap,
  Users,
  Calendar,
  User,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/storm-the-cup", label: "Tournament HQ", icon: Zap },
  { href: "/storm-the-cup#bracket", label: "Bracket", icon: Trophy },
  { href: "/storm-the-cup/match/group-a-m5", label: "Matches", icon: Calendar },
  { href: "/storm-the-cup/u/BracketKing", label: "Profile", icon: User },
  { href: "/storm-the-cup/vault/chamber", label: "Vault Chamber", icon: Shield },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/storm-the-cup" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-storm-accent text-storm-accent-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Storm the Cup</span>
            <span className="text-[10px] text-muted-foreground">2026 World Cup</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const basePath = item.href.split("?")[0].split("#")[0];
                const isActive =
                  pathname === basePath || pathname.startsWith(basePath + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:hidden">
        <Badge variant="outline" className="w-full justify-center gap-1 text-[10px]">
          <Zap className="h-3 w-3 text-storm-lightning" />
          Unlimited Wagering
        </Badge>
      </SidebarFooter>
    </Sidebar>
  );
}
