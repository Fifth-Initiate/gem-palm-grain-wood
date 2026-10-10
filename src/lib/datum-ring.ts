import { FIFTH, formatCents, survey } from "@/lib/number-geometry";
import { GRAINS } from "@/lib/grains";

export const DATUM_NAME = "gem-palm-grain-wood";

const MICRO = new Set([
  "src/components/instrument.tsx",
  "src/components/phase-figure.tsx",
  "src/components/spectrograph.tsx",
  "src/lib/number-geometry.ts",
  "src/routes/index.tsx",
  "src/styles.css",
  "src/router.tsx",
]);

export type StruckGrain = {
  path: string;
  size: number;
  residue: number;
  phase: number;
  cents: number;
  micro: boolean;
};

export type DatumReturn = {
  index: number;
  cents: number;
};

export type DatumRing = {
  grains: StruckGrain[];
  count: number[];
  mass: number[];
  returns: DatumReturn[];
  bytes: number;
  railMass: number;
  microCount: number;
  microBytes: number;
  primeLock: number;
};

function cosine(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return dot / Math.sqrt(na * nb);
}

export function ringDatum(): DatumRing {
  const count = Array.from({ length: 12 }, () => 0);
  const mass = Array.from({ length: 12 }, () => 0);
  const grains: StruckGrain[] = [];
  const returns: DatumReturn[] = [];
  let phase = 0;
  let best = Infinity;
  let bytes = 0;
  let microCount = 0;
  let microBytes = 0;

  GRAINS.forEach(([filePath, size], index) => {
    const residue = size % 12;
    count[residue] = (count[residue] ?? 0) + 1;
    mass[residue] = (mass[residue] ?? 0) + size;
    bytes += size;
    phase = (phase + size * FIFTH) % 1;
    const dist = Math.min(phase, 1 - phase);
    const cents = dist * 1200;
    if (cents < best - 1e-6) {
      best = cents;
      returns.push({ index, cents });
    }
    const micro = MICRO.has(filePath);
    if (micro) {
      microCount += 1;
      microBytes += size;
    }
    grains.push({ path: filePath, size, residue, phase, cents, micro });
  });

  const primeBins = Array.from({ length: 12 }, () => 0);
  for (const prime of survey(180).primes) primeBins[prime % 12] = (primeBins[prime % 12] ?? 0) + 1;

  const railMass = (mass[1] ?? 0) + (mass[5] ?? 0) + (mass[7] ?? 0) + (mass[11] ?? 0);

  return {
    grains,
    count,
    mass,
    returns,
    bytes,
    railMass,
    microCount,
    microBytes,
    primeLock: cosine(count, primeBins),
  };
}

export function grainName(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

export function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  if (bytes >= 10_000) return `${Math.round(bytes / 1000)} KB`;
  return `${bytes} B`;
}

export { formatCents };
