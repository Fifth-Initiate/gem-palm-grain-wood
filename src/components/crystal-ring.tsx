import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import {
  DATUM_NAME,
  formatBytes,
  formatCents,
  grainName,
  ringDatum,
} from "@/lib/datum-ring";
import { round2 } from "@/lib/number-geometry";

const CX = 220;
const CY = 220;
const RAILS = new Set([1, 5, 7, 11]);

function polar(turns: number, radius: number) {
  const theta = -Math.PI / 2 + turns * Math.PI * 2;
  return {
    x: round2(CX + radius * Math.cos(theta)),
    y: round2(CY + radius * Math.sin(theta)),
  };
}

export function CrystalRing() {
  const datum = useMemo(() => ringDatum(), []);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = datum.grains[index] ?? datum.grains[0]!;
  const heaviest = useMemo(
    () => [...datum.grains].sort((a, b) => b.size - a.size).slice(0, 2),
    [datum],
  );
  const maxMass = Math.max(...datum.mass);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1 >= datum.grains.length ? 0 : value + 1));
    }, 90);
    return () => window.clearInterval(id);
  }, [playing, datum.grains.length]);

  const railShare = datum.railMass / datum.bytes;

  return (
    <section className="mt-8 border border-line p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-widest text-brass uppercase">Crystal · {DATUM_NAME}</p>
          <h2 className="mt-1 font-display text-2xl text-paper">Datum ring</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={playing}
            onClick={() => setPlaying((value) => !value)}
            className={`inline-flex h-11 items-center gap-2 border px-3 text-sm ${
              playing ? "border-brass text-brass" : "border-line bg-panel text-paper"
            }`}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            {playing ? "Stop ring" : "Strike"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setIndex((value) => (value + 1 >= datum.grains.length ? 0 : value + 1));
            }}
            className="inline-flex h-11 items-center border border-line bg-panel px-3 text-sm text-paper"
          >
            Next grain
          </button>
        </div>
      </div>

      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <div className="min-w-0">
          <svg
            viewBox="0 0 440 440"
            role="img"
            aria-label={`Crystal of ${datum.grains.length} files rung by the just fifth. Current grain ${current.path}, ${formatCents(current.cents)} cents from unison.`}
            className="mx-auto h-auto w-full max-w-xl overflow-visible font-mono"
          >
            <circle cx={CX} cy={CY} r={168} className="fill-none stroke-line stroke-1" />
            {Array.from({ length: 12 }, (_, residue) => {
              const a = polar(residue / 12, 162);
              const b = polar(residue / 12, residue % 3 === 0 ? 176 : 172);
              const rail = RAILS.has(residue);
              return (
                <line
                  key={residue}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={rail ? "stroke-brass stroke-1" : "stroke-faint stroke-1"}
                />
              );
            })}
            {datum.grains.map((grain, grainIndex) => {
              const point = polar(grain.phase, 132);
              const scale = Math.log(grain.size + 1) / Math.log(datum.bytes);
              const radius = round2(1.3 + scale * 7);
              const on = grainIndex === index;
              const rail = RAILS.has(grain.residue);
              return (
                <circle
                  key={grain.path}
                  cx={point.x}
                  cy={point.y}
                  r={on ? radius + 2 : radius}
                  className={
                    grain.micro
                      ? "fill-ink stroke-paper stroke-2"
                      : rail
                        ? "fill-brass"
                        : "fill-faint opacity-60"
                  }
                >
                  <title>{`${grain.path} · ${grain.size} B · ≡ ${grain.residue}`}</title>
                </circle>
              );
            })}
            {(() => {
              const point = polar(current.phase, 168);
              return <circle cx={point.x} cy={point.y} r={4} className="fill-brass" />;
            })()}
            {[0, 1, 3, 5, 7, 9, 11].map((residue) => {
              const point = polar(residue / 12, 196);
              const rail = RAILS.has(residue);
              return (
                <text
                  key={residue}
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={rail ? "fill-brass text-xs" : "fill-faint text-xs"}
                >
                  {residue}
                </text>
              );
            })}
          </svg>
          <p className="mt-2 text-xs text-faint">
            Each grain is where the byte-walk has carried the fifth. Paper rings are the instrument
            source. Brass grains weigh onto a prime rail.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="font-display text-3xl leading-none text-brass tabular-nums">
              {formatCents(current.cents)}¢
            </p>
            <p className="mt-2 text-sm text-paper">{grainName(current.path)}</p>
            <p className="mt-1 text-xs break-all text-faint">{current.path}</p>
            <p className="mt-2 text-sm text-faint tabular-nums">
              {formatBytes(current.size)} · ≡ {current.residue} mod 12 · grain {index + 1} of{" "}
              {datum.grains.length}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-faint">Files</dt>
            <dd className="text-right text-paper tabular-nums">{datum.grains.length}</dd>
            <dt className="text-faint">Bytes</dt>
            <dd className="text-right text-paper tabular-nums">{formatBytes(datum.bytes)}</dd>
            <dt className="text-faint">Rail mass</dt>
            <dd className="text-right text-brass tabular-nums">{(railShare * 100).toFixed(1)}%</dd>
            <dt className="text-faint">Flat would be</dt>
            <dd className="text-right text-paper tabular-nums">33.3%</dd>
            <dt className="text-faint">Lock to primes</dt>
            <dd className="text-right text-paper tabular-nums">{datum.primeLock.toFixed(2)}</dd>
            <dt className="text-faint">Instrument</dt>
            <dd className="text-right text-paper tabular-nums">
              {datum.microCount} · {formatBytes(datum.microBytes)}
            </dd>
          </dl>
          <div>
            <p className="text-xs tracking-widest text-faint uppercase">Returns of this walk</p>
            <div className="mt-2">
              {datum.returns.map((hit) => (
                <button
                  key={hit.index}
                  type="button"
                  aria-pressed={hit.index === index}
                  onClick={() => {
                    setPlaying(false);
                    setIndex(hit.index);
                  }}
                  className={`flex h-11 w-full items-center justify-between border-b border-line text-left text-sm tabular-nums ${
                    hit.index === index ? "text-brass" : "text-paper"
                  }`}
                >
                  <span className="truncate pr-3">{grainName(datum.grains[hit.index]!.path)}</span>
                  <span>{formatCents(hit.cents)}¢</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-6 font-display text-xl text-paper">Chromatograph</h3>
      <p className="mt-1 text-sm text-faint">
        Byte mass by size mod 12. Brass columns are the prime rails. The tall paper columns are the
        spokes the sieve kills.
      </p>
      <div className="mt-4 grid grid-cols-12 gap-1 sm:gap-2">
        {datum.mass.map((value, residue) => {
          const rail = RAILS.has(residue);
          const dead = residue === 3 || residue === 9;
          const hot = current.residue === residue;
          return (
            <div key={residue} className="flex flex-col items-center gap-1">
              <div className="flex h-28 w-full items-end">
                <div
                  className={`w-full ${rail ? "bg-brass" : dead ? "bg-paper" : "bg-faint"} ${hot ? "opacity-100" : "opacity-80"}`}
                  style={{ height: `${Math.max(4, (value / maxMass) * 100)}%` }}
                />
              </div>
              <span className={`text-xs tabular-nums ${rail ? "text-brass" : "text-faint"}`}>
                {residue}
              </span>
            </div>
          );
        })}
      </div>
      <ul className="mt-4 flex flex-col gap-1 text-sm text-faint">
        {heaviest.map((grain) => (
          <li key={grain.path} className="tabular-nums">
            <span className="text-paper">{grainName(grain.path)}</span> {formatBytes(grain.size)} · ≡{" "}
            {grain.residue}
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-pretty text-faint">
        Striking the repo walks its files in path order and advances the same just fifth by each
        file’s byte count. The walk is back within {formatCents(datum.returns[datum.returns.length - 1]?.cents ?? 0)}¢
        of unison by {grainName(datum.grains[datum.returns[datum.returns.length - 1]?.index ?? 0]!.path)}.
        That is recurrence of this crystal, not a second comma. The prime clock is locked to four
        rays. This datum is not: only {(railShare * 100).toFixed(1)}% of its bytes sit on those
        rays, and the two heaviest grains land on {heaviest[0]?.residue} and {heaviest[1]?.residue},
        the spokes the sieve marks composite. The instrument source is the paper inclusion inside
        the ring — a microle of the same circle, not a copy of the lock. Cosine of the file-count
        vector against primes through 180 is {datum.primeLock.toFixed(2)}.
      </p>
    </section>
  );
}
