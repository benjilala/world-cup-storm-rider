import { create } from "zustand";

interface SocialStoreState {
  following: Set<string>;
  followers: Set<string>;
  hideStakes: boolean;
  delayedReveal: boolean;
  copySettings: { enabled: boolean; scaleStakes: number; sourceUserId: string | null };

  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  toggleHideStakes: () => void;
  toggleDelayedReveal: () => void;
  setCopySettings: (settings: Partial<SocialStoreState["copySettings"]>) => void;
  setFollowersOpen: (open: boolean) => void;
  followersSheetOpen: boolean;
}

export const useSocialStore = create<SocialStoreState>((set, get) => ({
  following: new Set<string>(),
  followers: new Set(["u1", "u3"]),
  hideStakes: false,
  delayedReveal: false,
  copySettings: { enabled: false, scaleStakes: 1, sourceUserId: null },
  followersSheetOpen: false,

  followUser: (userId) =>
    set((state) => {
      const next = new Set(state.following);
      next.add(userId);
      return { following: next };
    }),

  unfollowUser: (userId) =>
    set((state) => {
      const next = new Set(state.following);
      next.delete(userId);
      return { following: next };
    }),

  isFollowing: (userId) => get().following.has(userId),

  toggleHideStakes: () => set((state) => ({ hideStakes: !state.hideStakes })),
  toggleDelayedReveal: () => set((state) => ({ delayedReveal: !state.delayedReveal })),
  setCopySettings: (settings) =>
    set((state) => ({
      copySettings: { ...state.copySettings, ...settings },
    })),
  setFollowersOpen: (open) => set({ followersSheetOpen: open }),
}));
