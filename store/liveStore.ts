import { create } from "zustand";
import type { ActivityEvent, ChatMessage, OddsHistoryPoint } from "@/lib/types/storm";
import { activity as mockActivity, chat as mockChat, matches, oddsHistory as mockOdds, users } from "@/lib/mock/storm";

export interface LiveBet {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  amount: number;
  label: string;
  market: string;
  timestamp: string;
  isWhale: boolean;
}

interface LiveStoreState {
  nowMs: number;
  oddsTicks: OddsHistoryPoint[];
  activityFeed: ActivityEvent[];
  chatFeed: ChatMessage[];
  liveBets: LiveBet[];
  matchClock: Record<string, number>;
  viewerCount: number;
  isLive: boolean;

  startLive: () => void;
  stopLive: () => void;
  tickLive: () => void;
  addOddsTick: (tick: OddsHistoryPoint) => void;
  addActivityEvent: (event: ActivityEvent) => void;
  addChatMessage: (message: ChatMessage) => void;
  addLiveBet: (bet: LiveBet) => void;
  setMatchClock: (matchId: string, minutes: number) => void;
  hydrate: () => void;
}

export const useLiveStore = create<LiveStoreState>((set) => ({
  nowMs: Date.now(),
  oddsTicks: [],
  activityFeed: [],
  chatFeed: [],
  liveBets: [],
  matchClock: {},
  viewerCount: 0,
  isLive: false,

  startLive: () => set({ isLive: true, nowMs: Date.now() }),
  stopLive: () => set({ isLive: false }),

  tickLive: () =>
    set((state) => {
      const now = Date.now();
      const nextClock: Record<string, number> = { ...state.matchClock };
      for (const liveMatch of matches.filter((m) => m.status === "live")) {
        nextClock[liveMatch.id] = Math.min(90, (nextClock[liveMatch.id] ?? 57) + 1);
      }
      return {
        nowMs: now,
        matchClock: nextClock,
        viewerCount: Math.max(1200, state.viewerCount + Math.floor(Math.random() * 41) - 20),
      };
    }),

  addOddsTick: (tick) =>
    set((state) => ({
      oddsTicks: [...state.oddsTicks.slice(-99), tick],
    })),

  addActivityEvent: (event) =>
    set((state) => ({
      activityFeed: [event, ...state.activityFeed].slice(0, 50),
    })),

  addChatMessage: (message) =>
    set((state) => ({
      chatFeed: [...state.chatFeed, message].slice(-160),
    })),

  addLiveBet: (bet) =>
    set((state) => ({
      liveBets: [bet, ...state.liveBets].slice(0, 80),
    })),

  setMatchClock: (matchId, minutes) =>
    set((state) => ({
      matchClock: { ...state.matchClock, [matchId]: minutes },
    })),

  hydrate: () => {
    const seededBets = mockActivity
      .filter((ev) => ev.type === "bet_placed")
      .map((ev, i) => {
        const amount = Number(ev.description.match(/\$(\d+)/)?.[1] ?? 200);
        return {
          id: `lb-${ev.id}-${i}`,
          userId: ev.userId,
          username: ev.username,
          avatar: users.find((u) => u.id === ev.userId)?.avatar ?? ev.username.slice(0, 2).toUpperCase(),
          amount,
          label: ev.description,
          market: "1X2",
          timestamp: ev.timestamp,
          isWhale: amount >= 500,
        } satisfies LiveBet;
      });

    const seededChat = mockChat.map((msg, i) => ({
      ...msg,
      id: `${msg.id}-${i}`,
      matchId: "global",
    }));

    const initialClock: Record<string, number> = {};
    for (const m of matches.filter((match) => match.status === "live")) {
      initialClock[m.id] = 57 + Math.floor(Math.random() * 16);
    }

    set({
      nowMs: Date.now(),
      oddsTicks: mockOdds,
      activityFeed: mockActivity,
      chatFeed: seededChat,
      liveBets: seededBets,
      matchClock: initialClock,
      viewerCount: 8200,
      isLive: true,
    });
  },
}));
