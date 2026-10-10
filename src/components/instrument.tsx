import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { PhaseFigure } from "@/components/phase-figure";
import { Spectrograph } from "@/components/spectrograph";
import { CrystalRing } from "@/components/crystal-ring";
import {
  COMMA_CENTS,
  RAIL_LIMIT,
  formatCents,
  phase,
  recurrenceRails,
  survey,
} from "@/lib/number-geometry";

export function Instrument() {
  const [horizon, setHorizon] = useState(180);
  const [pinned, setPinned] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [flowK, setFlowK] = useState(12);
  const [playing, setPlaying] = useState(false);
  const [showLadder, setShowLadder] = useState(false);
  const [showOctatonic, setShowOctatonic] = useState(true);
  const [showFold, setShowFold] = useState(true);
  const [showFifths, setShowFifths] = useState(true);

  const data = useMemo(() => survey(horizon), [horizon]);
  const rails = useMemo(() => recurrenceRails(RAIL_LIMIT), []);
  const primes = data.primes.filter((prime) => prime >= 3);
  const shown = hover != null && hover <= horizon ? hover : pinned;
  const stepNow = phase(flowK);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setFlowK((k) => (k >= RAIL_LIMIT ? 0 : k + 1));
    }, 420);
    return () => window.clearInterval(id);
  }, [playing]);

  function setHorizonSafe(next: number) {
    setHorizon(next);
    setHover(null);
    setPinned((current) => (current <= next ? current : 5));
  }

  function stepPrime(direction: -1 | 1) {
    const index = primes.indexOf(pinned);
    const next = primes[index + direction];
    if (next == null) return;
    setHover(null);
    setPinned(next);
  }

  function jumpFifth(k: number) {
    setShowFifths(true);
    setPlaying(false);
    setFlowK(k);
  }

  const left = shown - 2;
  const right = shown + 2;
  const leftTwin = left > 1 && data.isPrime(left) && data.isPrime(shown);
  const rightTwin = data.isPrime(shown) && data.isPrime(right);
  const both = leftTwin && rightTwin;
  const forced = [left, shown, right].find((value) => value % 3 === 0) ?? left;
  const pair = leftTwin ? `${left}–${shown}` : `${shown}–${right}`;
  const factor =
    forced > 3
      ? `${forced} is divisible by 3 and larger than 3, so that vertex is composite.`
      : `${forced} is divisible by 3.`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="border-b border-line pb-5">
        <p className="text-xs tracking-widest text-brass uppercase">Mod 12 · twin phase lock</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-display text-4xl leading-none text-balance text-paper sm:text-5xl">
            Fifth Intersection
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-pretty text-faint">
            The only prime that belongs to two twin pairs, drawn on the clock where those pairs
            can live.
          </p>
        </div>
      </header>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-end">
        <label className="block">
          <span className="flex items-baseline justify-between text-xs text-faint">
            <span>Horizon</span>
            <span className="text-sm text-paper tabular-nums">{horizon}</span>
          </span>
          <input
            type="range"
            min={36}
            max={960}
            step={12}
            value={horizon}
            aria-valuetext={`Primes through ${horizon}`}
            onChange={(event) => setHorizonSafe(Number(event.target.value))}
            className="mt-2 h-11 w-full"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <TransportButton pressed={playing} onClick={() => setPlaying((value) => !value)}>
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            {playing ? "Pause fifths" : "Play fifths"}
          </TransportButton>
          <TransportButton
            onClick={() => {
              setShowFifths(true);
              setFlowK((k) => (k >= RAIL_LIMIT ? 0 : k + 1));
            }}
          >
            Step
          </TransportButton>
          <TransportButton onClick={() => jumpFifth(12)}>Comma</TransportButton>
          <LayerButton pressed={showLadder} onClick={() => setShowLadder((value) => !value)}>
            Twin chords
          </LayerButton>
          <LayerButton
            pressed={showOctatonic}
            onClick={() => setShowOctatonic((value) => !value)}
          >
            Octatonic
          </LayerButton>
          <LayerButton pressed={showFold} onClick={() => setShowFold((value) => !value)}>
            Mod 6
          </LayerButton>
          <LayerButton pressed={showFifths} onClick={() => setShowFifths((value) => !value)}>
            Fifths
          </LayerButton>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]">
        <section className="min-w-0 border border-line bg-ink p-3 sm:p-4">
          <div
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                stepPrime(1);
                event.preventDefault();
              }
              if (event.key === "ArrowLeft") {
                stepPrime(-1);
                event.preventDefault();
              }
            }}
            className="outline-none"
          >
            <PhaseFigure
              survey={data}
              horizon={horizon}
              selected={shown}
              flowK={flowK}
              showLadder={showLadder}
              showOctatonic={showOctatonic}
              showFold={showFold}
              showFifths={showFifths}
              onHover={setHover}
              onPin={(prime) => {
                setHover(null);
                setPinned(prime);
              }}
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-faint">
            <li className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-brass" />
              Prime on a rail
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-px w-4 bg-brass" />
              Twin chord
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full border border-brass" />
              3, the only prime off the rails
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block size-2 rotate-45 border border-brass" />
              Square vertex is divisible by 3
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-px w-4 border-t border-dashed border-brass" />
              Dashed ray: same class mod 6, opposite side
            </li>
          </ul>
        </section>

        <aside className="flex min-w-0 flex-col gap-5 border border-line bg-panel p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <IconButton label="Previous prime" onClick={() => stepPrime(-1)} disabled={primes[0] === pinned}>
                <ChevronLeft className="size-5" />
              </IconButton>
              <div className="text-center">
                <p className="font-display text-5xl leading-none text-brass tabular-nums">{shown}</p>
                <p className="mt-1 text-xs text-faint tabular-nums">
                  ≡ {shown % 12} mod 12 · ≡ {shown % 6} mod 6
                </p>
              </div>
              <IconButton
                label="Next prime"
                onClick={() => stepPrime(1)}
                disabled={primes[primes.length - 1] === pinned}
              >
                <ChevronRight className="size-5" />
              </IconButton>
            </div>
            <p className={`mt-4 text-sm leading-relaxed ${both ? "text-brass" : "text-paper"}`}>
              {both
                ? "Intersection. Both neighbors are prime — the only time this happens."
                : "Not an intersection. One neighbor fails."}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-faint">
              {both
                ? `${left}, ${shown}, and ${right} cover every residue mod 3. The multiple of 3 is ${forced} itself, so it is still prime. No later triple has that escape.`
                : leftTwin || rightTwin
                  ? `${factor} One chord remains, ${pair}. An intersection needs both.`
                  : `${factor} Neither neighbor is prime.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[left, shown, right].map((value) => {
              const prime = value > 1 && data.isPrime(value);
              const mid = value === shown;
              return (
                <div key={value} className="border border-line px-2 py-2">
                  <p className="text-xs text-faint tabular-nums">{value % 3} mod 3</p>
                  <p
                    className={`mt-1 font-display text-2xl leading-none tabular-nums ${
                      prime ? (mid ? "text-brass" : "text-paper") : "text-faint line-through"
                    }`}
                  >
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    {prime ? "prime" : value > 3 && value % 3 === 0 ? "÷ 3" : "composite"}
                  </p>
                </div>
              );
            })}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Count label="Shared vertices" value={data.intersections} emphasize />
            <Count label="Chords 5–7" value={data.channelCount["5-7"]} />
            <Count label="Chords 11–1" value={data.channelCount["11-1"]} />
            <Count label="Chord 3–5" value={data.channelCount["3-5"]} />
          </dl>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl text-paper">Recurrence rails</h2>
              <p className="text-xs text-faint tabular-nums">
                step {flowK}
                {flowK === 12 ? " · comma" : ""}
              </p>
            </div>
            <p className="mt-1 text-sm text-faint tabular-nums">
              Just fifth is {formatCents(stepNow.cents)}¢ from unison. Tempered residue {stepNow.et}.
              Comma {formatCents(COMMA_CENTS)}¢ = 531441/524288.
            </p>
            <div className="mt-3 flex flex-col">
              {rails.map((rail) => {
                const active = rail.k === flowK;
                return (
                  <button
                    key={rail.k}
                    type="button"
                    onClick={() => jumpFifth(rail.k)}
                    aria-pressed={active}
                    className={`flex h-11 items-center justify-between gap-3 border-b border-line px-1 text-left text-sm tabular-nums ${
                      active ? "text-brass" : "text-paper"
                    }`}
                  >
                    <span>{rail.k} fifths</span>
                    <span className="text-faint">
                      {rail.k === 12 ? "comma" : "return"}
                    </span>
                    <span>{formatCents(rail.k === 12 ? COMMA_CENTS : rail.cents)}¢</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8 border border-line p-4">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-2xl text-paper">Rail spectrograph</h2>
          <p className="text-xs text-faint">Ticks are primes. Staples are twin chords. Cursor is {shown}.</p>
        </div>
        <Spectrograph survey={data} horizon={horizon} selected={shown} />
        <div className="mt-2 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] text-xs text-faint tabular-nums">
          <span />
          <span className="flex justify-between">
            <span>0</span>
            <span>{horizon}</span>
          </span>
          <span />
        </div>
      </section>

      <CrystalRing />

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <Reading title="Rails">
          Every prime past 3 stands on 1, 5, 7, or 11 mod 12 — the units of this clock. As
          pitch-classes they are the odd whole-tone scale after 3 and 9 are removed, and they sit
          in exactly one octatonic mode: 1, 2, 4, 5, 7, 8, 10, 11. The even notes of that mode are
          the open dots. The sieve of 2 already killed them.
        </Reading>
        <Reading title="Mod 6 fold">
          The dashed diameters are the collapse: 7 ≡ 1 and 11 ≡ 5 mod 6. So the list 1, 5, 7, 11 is
          not four classes mod 6. It is the mod-12 splitting of the only two legal classes. Twin
          primes past 3 are always a 5 followed by a 1, mod 6 — here, the bottom fan (5, 7) and the
          top fan (11, 1).
        </Reading>
        <Reading title="Why the intersection is unique">
          p−2, p, and p+2 meet every residue mod 3, so one of them is divisible by 3. The only prime
          divisible by 3 is 3. The triple (3, 5, 7) is therefore the only one, and 5 is the only
          shared vertex: the chord from 3 meets the chord to 7 there. The center triangle is that
          argument. Its square vertex is the one forced to be 0 mod 3. Step the prime and watch that
          vertex go hollow.
        </Reading>
        <Reading title="Comma, then recurrence">
          A just fifth turns the octave by log₂(3/2), which is irrational, so the orbit is dense and
          comes arbitrarily close to unison again. Twelve fifths miss seven octaves by the
          Pythagorean comma, the wedge at 0. The open ring is equal temperament, which pretends the
          wedge is shut. Each row under recurrence rails is a record approach — Poincaré return, not
          a closer comma. Click a row to park the fifth there.
        </Reading>
        <Reading title="Projection, not serotonin">
          A dot-product attention score keeps the part of a vector that lies along a query.
          Landing on a rail is the same kind of act: the integer is kept only as its coordinate on
          this clock. That is the parallel. It does not say anything about serotonin, or about how a
          nervous system integrates space.
        </Reading>
      </section>
    </main>
  );
}

function Count({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <>
      <dt className="text-faint">{label}</dt>
      <dd className={`text-right tabular-nums ${emphasize ? "text-brass" : "text-paper"}`}>
        {value}
      </dd>
    </>
  );
}

function Reading({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <h2 className="font-display text-xl text-paper">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-pretty text-faint">{children}</p>
    </div>
  );
}

function TransportButton({
  children,
  onClick,
  pressed = false,
}: {
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-11 items-center gap-2 border px-3 text-sm ${
        pressed
          ? "border-brass bg-panel text-brass"
          : "border-line bg-panel text-paper"
      }`}
    >
      {children}
    </button>
  );
}

function LayerButton({
  children,
  pressed,
  onClick,
}: {
  children: ReactNode;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-11 items-center border px-3 text-sm ${
        pressed ? "border-brass text-brass" : "border-line text-faint"
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-11 items-center justify-center border border-line text-paper disabled:opacity-40"
    >
      {children}
    </button>
  );
}
