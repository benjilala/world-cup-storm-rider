"use client";

import { type ReactNode, type MouseEvent, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import type { PendingIntent } from "@/lib/types/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuthGateProps {
  children: ReactNode;
  intent?: PendingIntent;
  onAuthed?: () => void;
  fallbackLabel?: string;
  /** Render as a wrapper div instead of span (useful for block-level children). */
  block?: boolean;
  className?: string;
}

/**
 * Wraps any interactive element with auth gating.
 * - Authenticated: renders children directly (fires onAuthed on click if provided).
 * - Unauthenticated: shows a tooltip hint on hover and
 *   opens the AuthDialog with an optional pending intent on click.
 */
export function AuthGate({
  children,
  intent,
  onAuthed,
  fallbackLabel = "Sign in to continue",
  block = false,
  className,
}: AuthGateProps) {
  const { isAuthenticated, openAuthDialog } = useAuthStore();

  const handleGatedClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      openAuthDialog(intent);
    },
    [openAuthDialog, intent]
  );

  const Wrapper = block ? "div" : "span";

  if (isAuthenticated) {
    return (
      <Wrapper onClick={onAuthed} className={className ?? "cursor-pointer"}>
        {children}
      </Wrapper>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Wrapper
          className={className ?? "cursor-pointer"}
          onClickCapture={handleGatedClick}
        >
          {children}
        </Wrapper>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{fallbackLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}
