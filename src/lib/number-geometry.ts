export const RAILS = [1, 5, 7, 11] as const;
export type Rail = (typeof RAILS)[number];

export const OCTATONIC = [1, 2, 4, 5, 7, 8, 10, 11] as const;
export const OCTATONIC_EVEN = [2, 4, 8, 10] as const;

/** Just perfect fifth, in octaves. Irrational, so the orbit never closes. */
export const FIFTH = Math.log2(3 / 2);

/** 12 fifths − 7 octaves = 531441/524288. */
export const COMMA_CENTS = 1200 * Math.log2(531441 / 524288);

export const RAIL_LIMIT = 700;

export type Channel = "3-5" | "5-7" | "11-1";

export type Twin = {
  p: number;
  q: number;
  channel: Channel;
};

export type Survey = {
  primes: number[];
  twins: Twin[];
  railCount: Record<Rail, number>;
  channelCount: Record<Channel, number>;
  intersections: number;
  isPrime: (n: number) => boolean;
};

function channelOf(p: number): Channel | null {
  const r = p % 12;
  if (r === 3) return "3-5";
  if (r === 5) return "5-7";
  if (r === 11) return "11-1";
  return null;
}

export function survey(limit: number): Survey {
  const flag = new Uint8Array(limit + 1);
  flag.fill(1);
  if (limit >= 0) flag[0] = 0;
  if (limit >= 1) flag[1] = 0;
  for (let i = 2; i * i <= limit; i++) {
    if (!flag[i]) continue;
    for (let j = i * i; j <= limit; j += i) flag[j] = 0;
  }

  const primes: number[] = [];
  const railCount: Record<Rail, number> = { 1: 0, 5: 0, 7: 0, 11: 0 };
  for (let n = 2; n <= limit; n++) {
    if (!flag[n]) continue;
    primes.push(n);
    if (n > 3) {
      const r = n % 12;
      if (r === 1 || r === 5 || r === 7 || r === 11) railCount[r] += 1;
    }
  }

  const twins: Twin[] = [];
  const channelCount: Record<Channel, number> = {
    "3-5": 0,
    "5-7": 0,
    "11-1": 0,
  };
  for (const p of primes) {
    if (p + 2 > limit || !flag[p + 2]) continue;
    const channel = channelOf(p);
    if (!channel) continue;
    twins.push({ p, q: p + 2, channel });
    channelCount[channel] += 1;
  }

  const starts = new Set(twins.map((twin) => twin.p));
  let intersections = 0;
  for (const twin of twins) if (starts.has(twin.q)) intersections += 1;

  return {
    primes,
    twins,
    railCount,
    channelCount,
    intersections,
    isPrime: (n: number) => n >= 0 && n <= limit && flag[n] === 1,
  };
}

export function phase(k: number): { frac: number; cents: number; et: number } {
  const turns = k * FIFTH;
  const frac = turns - Math.floor(turns);
  const dist = Math.min(frac, 1 - frac);
  return { frac, cents: dist * 1200, et: ((7 * k) % 12 + 12) % 12 };
}

export function recurrenceRails(maxK: number): { k: number; cents: number }[] {
  let best = Infinity;
  const rails: { k: number; cents: number }[] = [];
  for (let k = 1; k <= maxK; k++) {
    const { cents } = phase(k);
    if (cents < best - 1e-6) {
      best = cents;
      rails.push({ k, cents });
    }
  }
  return rails;
}

export function radiusAt(
  p: number,
  horizon: number,
  inner: number,
  outer: number,
): number {
  const t = Math.log(p) / Math.log(horizon);
  const clamped = Math.min(1, Math.max(0, t));
  return inner + clamped * (outer - inner);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatCents(cents: number): string {
  if (cents >= 100) return cents.toFixed(0);
  if (cents >= 40) return cents.toFixed(1);
  return cents.toFixed(2);
}
