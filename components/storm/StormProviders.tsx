"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLiveStore } from "@/store/liveStore";
import { Toaster } from "@/components/ui/sonner";

export function StormProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().hydrate();
    useLiveStore.getState().hydrate();
  }, []);

  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  );
}
