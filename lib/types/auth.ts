export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  balance: number;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface SignUpPayload {
  email: string;
  username: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  session?: Session;
  error?: string;
}

export type PendingIntent =
  | { type: "add_to_slip"; selectionId: string; marketId: string }
  | { type: "start_run"; stake: number }
  | { type: "follow_user"; userId: string }
  | { type: "copy_picks"; userId: string }
  | { type: "place_bet"; wagerId: string }
  | null;
