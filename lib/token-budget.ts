const DAY_MS = 24 * 60 * 60 * 1000;

let windowStart = Date.now();
let spent = 0;

function roll(now: number) {
  if (now - windowStart >= DAY_MS) {
    windowStart = now;
    spent = 0;
  }
}

function parseLimit(): number | null {
  const raw = process.env.ANTHROPIC_DAILY_TOKEN_BUDGET;
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function canSpend(): { ok: true } | { ok: false; retryAfterSec: number } {
  const limit = parseLimit();
  if (!limit) return { ok: true };
  const now = Date.now();
  roll(now);
  if (spent >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((windowStart + DAY_MS - now) / 1000) };
  }
  return { ok: true };
}

export function recordSpend(tokens: number) {
  roll(Date.now());
  spent += Math.max(0, tokens | 0);
}

export function getBudgetSnapshot() {
  roll(Date.now());
  const limit = parseLimit();
  return {
    limit,
    spent,
    remaining: limit ? Math.max(0, limit - spent) : null,
    resetAt: new Date(windowStart + DAY_MS).toISOString(),
  };
}
