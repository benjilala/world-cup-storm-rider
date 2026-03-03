"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { CreditCard, Bitcoin, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export function AddFundsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addFunds: doAddFunds, session } = useAuthStore();
  const [amount, setAmount] = useState(100);
  const [method, setMethod] = useState<"card" | "crypto">("card");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdd = async () => {
    if (amount <= 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    doAddFunds(amount);
    setLoading(false);
    setSuccess(true);
    toast.success(`$${amount.toLocaleString()} deposited successfully`);
    setTimeout(() => {
      setSuccess(false);
      onOpenChange(false);
    }, 1200);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSuccess(false);
      setAmount(100);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Funds</DrawerTitle>
            <DrawerDescription>
              {session?.user.balance === 0
                ? "Deposit funds to start placing bets"
                : "Choose an amount to deposit"}
            </DrawerDescription>
          </DrawerHeader>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="rounded-full bg-storm-vault/10 p-3">
                <CheckCircle2 className="h-8 w-8 text-storm-vault" />
              </div>
              <p className="text-sm font-medium">Funds added!</p>
              <p className="text-2xl font-mono font-bold">
                ${amount.toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="px-4 pb-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {PRESET_AMOUNTS.map((a) => (
                  <Button
                    key={a}
                    variant={amount === a ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(a)}
                    className="flex-1 min-w-[4rem]"
                  >
                    ${a}
                  </Button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Custom amount
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={1}
                  className="font-mono"
                  placeholder="Enter amount"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={method === "card" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setMethod("card")}
                >
                  <CreditCard className="h-4 w-4" />
                  Card
                </Button>
                <Button
                  variant={method === "crypto" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => setMethod("crypto")}
                >
                  <Bitcoin className="h-4 w-4" />
                  Crypto
                </Button>
              </div>
            </div>
          )}

          <DrawerFooter>
            {!success && (
              <>
                <Button
                  onClick={handleAdd}
                  disabled={loading || amount <= 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    `Deposit $${amount.toLocaleString()}`
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">
                    {session?.user.balance === 0 ? "Skip for now" : "Cancel"}
                  </Button>
                </DrawerClose>
              </>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
