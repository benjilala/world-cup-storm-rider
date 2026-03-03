"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { useBetSlipStore } from "@/store/betSlipStore";
import { useSocialStore } from "@/store/socialStore";
import { SignUpForm } from "./SignUpForm";
import { SignInForm } from "./SignInForm";
import { AddFundsDrawer } from "./AddFundsDrawer";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import type { PendingIntent } from "@/lib/types/auth";

function executePendingIntent(
  intent: PendingIntent,
  deps: {
    addSelection: (sel: { id: string; marketId: string; matchId: string; label: string; odds: number }) => void;
    openSlip: () => void;
    followUser: (userId: string) => void;
  }
) {
  if (!intent) return;

  switch (intent.type) {
    case "add_to_slip":
      deps.addSelection({
        id: intent.selectionId,
        marketId: intent.marketId,
        matchId: "",
        label: `Selection ${intent.selectionId}`,
        odds: 1.5,
      });
      deps.openSlip();
      toast.success("Selection added to your bet slip");
      break;
    case "follow_user":
      deps.followUser(intent.userId);
      toast.success("User followed");
      break;
    case "copy_picks":
      toast.success("Picks copied to your bracket");
      break;
    case "start_run":
      toast.success("Storm Run ready — set your stake to begin");
      break;
    case "place_bet":
      deps.openSlip();
      toast.success("Bet slip restored — confirm to place");
      break;
  }
}

export function AuthDialog() {
  const { authDialogOpen, closeAuthDialog, consumePendingIntent, session } =
    useAuthStore();
  const { addSelection, openSlip } = useBetSlipStore();
  const { followUser } = useSocialStore();

  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [showFundsDrawer, setShowFundsDrawer] = useState(false);

  const handlePostAuth = useCallback(
    (isNewAccount: boolean) => {
      const intent = consumePendingIntent();

      executePendingIntent(intent, { addSelection, openSlip, followUser });

      if (isNewAccount) {
        setTimeout(() => setShowFundsDrawer(true), 300);
      }
    },
    [consumePendingIntent, addSelection, openSlip, followUser]
  );

  return (
    <>
      <Dialog
        open={authDialogOpen}
        onOpenChange={(open) => !open && closeAuthDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-storm-accent/10">
              <Zap className="h-6 w-6 text-storm-accent" />
            </div>
            <DialogTitle className="text-center">
              {mode === "signup" ? "Join the Storm" : "Welcome Back"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {mode === "signup"
                ? "Create your account to start placing bets and building your bracket."
                : "Sign in to your account to continue."}
            </DialogDescription>
          </DialogHeader>

          {mode === "signup" ? (
            <SignUpForm onSuccess={() => handlePostAuth(true)} />
          ) : (
            <SignInForm onSuccess={() => handlePostAuth(false)} />
          )}

          <div className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  className="text-foreground underline underline-offset-2 hover:text-storm-accent transition-colors"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Storm the Cup?{" "}
                <button
                  className="text-foreground underline underline-offset-2 hover:text-storm-accent transition-colors"
                  onClick={() => setMode("signup")}
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddFundsDrawer
        open={showFundsDrawer}
        onOpenChange={setShowFundsDrawer}
      />
    </>
  );
}
