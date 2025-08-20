const WINDOW_MS = 10_000; // 10 seconds
const MAX_MSGS = 5;       // max 5 messages per window

type State = Map<string, number[]>; // userId -> timestamps (ms)
const state: State = new Map();

export function checkMessageRate(userId: string): boolean {
  const now = Date.now();
  const arr = state.get(userId) ?? [];
  const fresh = arr.filter(ts => now - ts <= WINDOW_MS);
  if (fresh.length >= MAX_MSGS) return false;
  fresh.push(now);
  state.set(userId, fresh);
  return true;
}