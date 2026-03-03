import Link from "next/link";
import {
  Trophy, ShieldCheck, Zap, TrendingUp, Users, Copy,
  MessageCircle, BarChart3, ChevronRight, Globe, Flame,
  Lock, Rocket, Crown, Star, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <BracketLines />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-8">
        {/* FIFA badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-storm-gold/30 bg-storm-gold/5 px-4 py-1.5">
          <Globe className="h-4 w-4 text-storm-gold" />
          <span className="text-xs font-semibold tracking-[0.2em] text-storm-gold">
            FIFA WORLD CUP 2026
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
          <span className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent">
            STORM
          </span>
          <br />
          <span className="bg-gradient-to-r from-storm-gold via-storm-gold to-storm-ride bg-clip-text text-transparent">
            THE CUP
          </span>
        </h1>

        {/* Tagline */}
        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Build your bracket. Start Storm Runs. Ride or vault at every
          checkpoint. Compete with the community for the ultimate prediction
          crown.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 gap-2 bg-storm-gold px-8 text-sm font-bold tracking-wide text-black hover:bg-storm-gold/90">
            <Link href="/storm-the-cup">
              Enter Tournament HQ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 gap-2 border-border/50 px-8 text-sm">
            <a href="#how-it-works">
              How It Works
              <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 sm:gap-10">
          <StatPill value="48" label="Group Matches" />
          <div className="hidden h-6 w-px bg-border/30 sm:block" />
          <StatPill value="64" label="Knockout Ties" />
          <div className="hidden h-6 w-px bg-border/30 sm:block" />
          <StatPill value="1" label="Champion" accent />
        </div>
      </div>
    </section>
  );
}

function StatPill({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-2xl font-black font-mono sm:text-3xl ${accent ? "text-storm-gold" : "text-foreground"}`}>
        {value}
      </span>
      <span className="text-xs tracking-wider text-muted-foreground uppercase">{label}</span>
    </div>
  );
}

function BracketLines() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bracket-grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M 0 30 L 60 30 L 60 90 L 120 90" fill="none" stroke="white" strokeWidth="1" />
          <path d="M 0 90 L 60 90 L 60 30 L 120 30" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bracket-grid)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                       */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Trophy,
      title: "Build Your Bracket",
      description: "Pick group winners and knockout matchups through the interactive bracket. From 48 group stage matches all the way to the Final.",
      color: "text-storm-accent",
      bg: "bg-storm-accent/10",
      border: "border-storm-accent/20",
    },
    {
      step: "02",
      icon: ShieldCheck,
      title: "Ride or Vault",
      description: "After each stage, face the decision: ride with your full stake for bigger rewards, or vault a percentage to protect your gains.",
      color: "text-storm-ride",
      bg: "bg-storm-ride/10",
      border: "border-storm-ride/20",
    },
    {
      step: "03",
      icon: Zap,
      title: "Compete for the Crown",
      description: "Climb the leaderboard, earn Lightning multipliers up to 4x for perfect stages, and unlock the Vault Chamber at the Final.",
      color: "text-storm-gold",
      bg: "bg-storm-gold/10",
      border: "border-storm-gold/20",
    },
  ];

  return (
    <section id="how-it-works" className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <Badge variant="outline" className="mb-4 border-storm-accent/30 text-storm-accent text-[10px] tracking-widest">
            HOW IT WORKS
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three steps to the crown</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.step}
              className={`group relative rounded-2xl border ${s.border} ${s.bg} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground/50">{s.step}</span>
              </div>
              <h3 className={`mb-2 text-lg font-bold ${s.color}`}>{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Ride / Vault Explainer                                             */
/* ------------------------------------------------------------------ */

function RideVaultSection() {
  const stages = [
    { label: "Groups", pct: "10%" },
    { label: "R32", pct: "15%" },
    { label: "R16", pct: "20%" },
    { label: "QF", pct: "25%" },
    { label: "SF", pct: "30%" },
    { label: "Final", pct: "Unlock" },
  ];

  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <Badge variant="outline" className="mb-4 border-storm-ride/30 text-storm-ride text-[10px] tracking-widest">
            THE CORE MECHANIC
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Every stage. One decision.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            After each round of results, you face the fork. Your strategy defines your path.
          </p>
        </div>

        {/* Decision cards */}
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          {/* Ride */}
          <div className="rounded-2xl border border-storm-ride/30 bg-storm-ride/5 p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-storm-ride/15">
                <Rocket className="h-6 w-6 text-storm-ride" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-wide text-storm-ride">RIDE</h3>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-storm-ride/60">Full stake forward</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Keep your full stake in play. Higher risk, higher reward. One bad stage and your run could bust -- but nail it and your value snowballs.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-storm-ride/80">
              <Flame className="h-3.5 w-3.5" />
              <span className="font-semibold">Maximum upside potential</span>
            </div>
          </div>

          {/* OR divider */}
          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-card text-sm font-black text-muted-foreground">
              OR
            </div>
          </div>

          {/* Vault */}
          <div className="rounded-2xl border border-storm-vault/30 bg-storm-vault/5 p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-storm-vault/15">
                <Lock className="h-6 w-6 text-storm-vault" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-wide text-storm-vault">VAULT</h3>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-storm-vault/60">Lock in your gains</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Protect a percentage of your current value. It goes to the vault -- safe, untouchable. Smart players know when to bank their progress.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-storm-vault/80">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="font-semibold">Protected from bust</span>
            </div>
          </div>
        </div>

        {/* Stage progression bar */}
        <div className="mt-12 rounded-2xl border border-border/30 bg-card/50 p-6">
          <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Vault Percentage by Stage
          </p>
          <div className="flex items-end justify-between gap-2 sm:gap-4">
            {stages.map((s, i) => {
              const isFinal = i === stages.length - 1;
              return (
                <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className={`text-sm font-mono font-bold sm:text-base ${isFinal ? "text-storm-gold" : "text-foreground"}`}>
                    {s.pct}
                  </span>
                  <div
                    className={`w-full rounded-lg transition-all ${isFinal ? "bg-storm-gold/30" : "bg-storm-vault/30"}`}
                    style={{ height: `${20 + i * 16}px` }}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Lightning Multipliers                                              */
/* ------------------------------------------------------------------ */

function LightningSection() {
  const multipliers = [
    { stage: "Groups", mult: "2x" },
    { stage: "R32", mult: "4x" },
    { stage: "R16", mult: "4x" },
    { stage: "QF", mult: "3x" },
    { stage: "SF", mult: "2x" },
    { stage: "Final", mult: "2x" },
  ];

  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-storm-gold/20 bg-gradient-to-br from-storm-gold/5 via-card to-card p-8 sm:p-12">
          {/* Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-storm-gold/10 blur-3xl" />

          <div className="relative z-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-storm-gold/15 animate-breathe-glow">
              <Zap className="h-8 w-8 text-storm-gold" />
            </div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Lightning Multipliers
            </h2>
            <p className="mx-auto mb-10 max-w-md text-sm text-muted-foreground">
              Nail a perfect stage -- every single pick correct -- and your value gets a Lightning multiplier applied instantly.
            </p>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {multipliers.map((m) => (
                <div key={m.stage} className="rounded-xl border border-storm-gold/15 bg-storm-gold/5 p-3 transition-transform hover:scale-105">
                  <p className="text-2xl font-black font-mono text-storm-gold sm:text-3xl">{m.mult}</p>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground">{m.stage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Community                                                          */
/* ------------------------------------------------------------------ */

function CommunitySection() {
  const features = [
    {
      icon: MessageCircle,
      title: "Live Bracket Chat",
      description: "Talk strategy, react to results, and ride the hype with the community in real-time.",
      color: "text-storm-accent",
      bg: "bg-storm-accent/10",
    },
    {
      icon: Copy,
      title: "Copy-a-Bracket",
      description: "Follow top performers and copy their picks. Scale your stake and ride their expertise.",
      color: "text-storm-live",
      bg: "bg-storm-live/10",
    },
    {
      icon: BarChart3,
      title: "Leaderboards",
      description: "ROI, Streak, and Most Copied rankings. See who is dominating the tournament and climb the board.",
      color: "text-storm-gold",
      bg: "bg-storm-gold/10",
    },
  ];

  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <Badge variant="outline" className="mb-4 border-storm-live/30 text-storm-live text-[10px] tracking-widest">
            COMMUNITY
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">You are never predicting alone</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            A living ecosystem of brackets, bets, and bragging rights.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="mb-2 text-base font-bold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA Footer                                                         */
/* ------------------------------------------------------------------ */

function CTAFooter() {
  return (
    <section className="relative px-6 py-32 sm:py-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-storm-gold/[0.03] via-transparent to-transparent" />
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <Crown className="mx-auto mb-6 h-12 w-12 text-storm-gold/40" />
        <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
          The World Cup starts here.
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm text-muted-foreground">
          48 teams. 104 matches. One prediction crown. Build your bracket, start your Storm Run, and compete with thousands.
        </p>
        <Button asChild size="lg" className="h-14 gap-3 bg-storm-gold px-10 text-base font-bold tracking-wide text-black shadow-[0_0_40px_8px_oklch(0.82_0.18_85/0.15)] transition-shadow hover:bg-storm-gold/90 hover:shadow-[0_0_60px_12px_oklch(0.82_0.18_85/0.25)]">
          <Link href="/storm-the-cup">
            Enter the Storm
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <p className="mt-12 text-[10px] tracking-wider text-muted-foreground/40">
          SIMULATION &mdash; NOT REAL WAGER DATA
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <Hero />
      <HowItWorks />
      <RideVaultSection />
      <LightningSection />
      <CommunitySection />
      <CTAFooter />
    </main>
  );
}
