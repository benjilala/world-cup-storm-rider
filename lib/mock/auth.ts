import type { User, Session, SignUpPayload, SignInPayload, AuthResult } from "@/lib/types/auth";

const STORAGE_KEY = "storm_session";

const mockUsers: Map<string, User & { password: string }> = new Map([
  [
    "demo@storm.gg",
    {
      id: "u-demo",
      username: "DemoPlayer",
      email: "demo@storm.gg",
      avatar: "DP",
      balance: 10000,
      createdAt: new Date(2026, 0, 1).toISOString(),
      password: "demo1234",
    },
  ],
]);

function generateToken(): string {
  return `stk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createSession(user: User): Session {
  return {
    user,
    token: generateToken(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function persist(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function signup(payload: SignUpPayload): Promise<AuthResult> {
  await new Promise((r) => setTimeout(r, 400));

  if (mockUsers.has(payload.email)) {
    return { success: false, error: "Email already registered" };
  }

  const user: User = {
    id: `u-${Date.now()}`,
    username: payload.username,
    email: payload.email,
    avatar: payload.username.slice(0, 2).toUpperCase(),
    balance: 0,
    createdAt: new Date().toISOString(),
  };

  mockUsers.set(payload.email, { ...user, password: payload.password });
  const session = createSession(user);
  persist(session);
  return { success: true, session };
}

export async function login(payload: SignInPayload): Promise<AuthResult> {
  await new Promise((r) => setTimeout(r, 400));

  const stored = mockUsers.get(payload.email);
  if (!stored || stored.password !== payload.password) {
    return { success: false, error: "Invalid email or password" };
  }

  const { password: _, ...user } = stored;
  const session = createSession(user);
  persist(session);
  return { success: true, session };
}

export async function logout(): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  persist(null);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (new Date(session.expiresAt) < new Date()) {
      persist(null);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function addFunds(amount: number): User | null {
  const session = getSession();
  if (!session) return null;
  session.user.balance += amount;
  persist(session);
  const stored = mockUsers.get(session.user.email);
  if (stored) stored.balance = session.user.balance;
  return session.user;
}
