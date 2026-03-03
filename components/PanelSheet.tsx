"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function PanelSheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "w-[520px] max-w-[94vw] border-white/10 bg-black/78 text-white backdrop-blur-xl",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/25 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_320px_at_20%_0%,rgba(0,255,209,0.06),transparent_55%),radial-gradient(900px_320px_at_80%_15%,rgba(0,174,255,0.05),transparent_55%)]" />
        <SheetHeader>
          <SheetTitle className="text-[11px] font-semibold tracking-widest text-white/80">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="relative mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

