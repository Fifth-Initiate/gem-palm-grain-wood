import {
  COMMA_CENTS,
  OCTATONIC,
  OCTATONIC_EVEN,
  phase,
  radiusAt,
  round2,
  type Survey,
} from "@/lib/number-geometry";

const CX = 240;
const CY = 240;
const RAY_INNER = 72;
const RAY_OUTER = 156;
const DISK = 56;
const TRI = 32;

function polar(residue: number, radius: number) {
  const theta = -Math.PI / 2 + (residue / 12) * Math.PI * 2;
  return {
    x: round2(CX + radius * Math.cos(theta)),
    y: round2(CY + radius * Math.sin(theta)),
  };
}

function arcPath(radius: number, fromRes: number, toRes: number) {
  const a = polar(fromRes, radius);
  const b = polar(toRes, radius);
  const delta = (((toRes - fromRes) % 12) + 12) % 12;
  const large = delta > 6 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

type Props = {
  survey: Survey;
  horizon: number;
  selected: number;
  flowK: number;
  showLadder: boolean;
  showOctatonic: boolean;
  showFold: boolean;
  showFifths: boolean;
  onHover: (prime: number | null) => void;
  onPin: (prime: number) => void;
};

export function PhaseFigure({
  survey,
  horizon,
  selected,
  flowK,
  showLadder,
  showOctatonic,
  showFold,
  showFifths,
  onHover,
  onPin,
}: Props) {
  const bead = (p: number) => polar(p % 12, radiusAt(p, horizon, RAY_INNER, RAY_OUTER));
  const plotted = survey.primes.filter((p) => p === 3 || p > 3);
  const now = phase(flowK);
  const just = polar(now.frac * 12, 182);
  const tempered = polar(now.et, 182);
  const commaEnd = (COMMA_CENTS / 1200) * 12;

  const tri = [0, 1, 2].map((residue) => {
    const theta = -Math.PI / 2 + (residue / 3) * Math.PI * 2;
    return {
      x: round2(CX + TRI * Math.cos(theta)),
      y: round2(CY + TRI * Math.sin(theta)),
    };
  });
  const members = [selected - 2, selected, selected + 2];

  const octagon = OCTATONIC.map((residue, index) => {
    const point = polar(residue, 164);
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 480 480"
      role="img"
      aria-label={`Mod 12 clock with prime rails at 1, 5, 7, and 11. Prime ${selected} is marked. The wedge at 0 is the Pythagorean comma.`}
      className="h-auto w-full overflow-visible font-mono"
      onPointerLeave={() => onHover(null)}
    >
      <circle cx={CX} cy={CY} r={170} className="fill-none stroke-line stroke-1" />

      {Array.from({ length: 12 }, (_, residue) => {
        if (residue === 1 || residue === 5 || residue === 7 || residue === 11 || residue === 3) {
          return null;
        }
        const a = polar(residue, residue === 0 ? 158 : 164);
        const b = polar(residue, residue === 0 ? 178 : 176);
        return (
          <line
            key={residue}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={residue === 0 ? "stroke-brass stroke-1" : "stroke-faint stroke-1"}
          />
        );
      })}

      {showOctatonic && (
        <g>
          <path d={`${octagon} Z`} className="fill-none stroke-faint stroke-1" />
          {OCTATONIC_EVEN.map((residue) => {
            const point = polar(residue, 164);
            return (
              <circle
                key={residue}
                cx={point.x}
                cy={point.y}
                r={2.4}
                className="fill-ink stroke-faint stroke-1"
              />
            );
          })}
        </g>
      )}

      {showFifths && (
        <path d={arcPath(190, 0, commaEnd)} className="fill-none stroke-brass stroke-2" />
      )}

      <Ray residue={3} className="stroke-faint stroke-1" />
      <Ray residue={1} className="stroke-brass stroke-1" />
      <Ray residue={5} className="stroke-brass stroke-2" />
      <Ray residue={7} className="stroke-brass stroke-1" dashed={showFold} />
      <Ray residue={11} className="stroke-brass stroke-1" dashed={showFold} />

      {survey.twins.map((twin) => {
        const emblem = twin.p === 3 || twin.p === 5;
        if (!emblem && !showLadder) return null;
        const a = bead(twin.p);
        const b = bead(twin.q);
        const hot = twin.p === selected || twin.q === selected;
        return (
          <line
            key={`${twin.p}-${twin.q}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={
              emblem || hot ? "stroke-brass stroke-2" : "stroke-brass stroke-1 opacity-35"
            }
          />
        );
      })}

      <circle cx={CX} cy={CY} r={DISK} className="fill-ink stroke-line stroke-1" />
      <path
        d={`M ${tri[0].x.toFixed(2)} ${tri[0].y.toFixed(2)} L ${tri[1].x.toFixed(2)} ${tri[1].y.toFixed(2)} L ${tri[2].x.toFixed(2)} ${tri[2].y.toFixed(2)} Z`}
        className="fill-none stroke-line stroke-1"
      />
      <rect
        x={tri[0].x - 7}
        y={tri[0].y - 7}
        width={14}
        height={14}
        transform={`rotate(45 ${tri[0].x} ${tri[0].y})`}
        className="fill-ink stroke-brass stroke-1"
      />
      {members.map((value) => {
        const point = tri[((value % 3) + 3) % 3]!;
        const prime = value > 1 && survey.isPrime(value);
        return (
          <circle
            key={value}
            cx={point.x}
            cy={point.y}
            r={prime ? 3.4 : 2.5}
            className={prime ? "fill-brass" : "fill-none stroke-faint stroke-1"}
          />
        );
      })}

      {plotted.map((prime) => {
        const point = bead(prime);
        const on = prime === selected;
        const intersection = prime === 5;
        return (
          <g key={prime}>
            {intersection && (
              <circle cx={point.x} cy={point.y} r={8} className="fill-none stroke-brass stroke-1" />
            )}
            {on && (
              <circle cx={point.x} cy={point.y} r={5.5} className="fill-none stroke-paper stroke-2" />
            )}
            <circle
              cx={point.x}
              cy={point.y}
              r={prime === 3 ? 3 : 2.6}
              className={prime === 3 ? "fill-ink stroke-brass stroke-2" : "fill-brass"}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r={10}
              className="cursor-pointer fill-transparent"
              onPointerEnter={() => onHover(prime)}
              onClick={() => onPin(prime)}
            >
              <title>{prime}</title>
            </circle>
          </g>
        );
      })}

      {showFifths && flowK <= 18
        ? Array.from({ length: flowK }, (_, index) => {
            const step = index + 1;
            const earlier = phase(step);
            const point = polar(earlier.frac * 12, round2(174 + (step / 12) * 14));
            const last = step === flowK;
            return (
              <circle
                key={step}
                cx={point.x}
                cy={point.y}
                r={last ? 3.4 : 1.7}
                className="fill-brass"
                opacity={last ? 1 : 0.55}
              />
            );
          })
        : null}
      {showFifths && flowK > 18 ? (
        <circle cx={just.x} cy={just.y} r={3.4} className="fill-brass" />
      ) : null}
      {showFifths && (
        <circle
          cx={tempered.x}
          cy={tempered.y}
          r={5}
          className="fill-ink stroke-paper stroke-1"
        />
      )}

      <ClockLabel residue={0} tone="faint">
        0
      </ClockLabel>
      <ClockLabel residue={1} tone="brass">
        1
      </ClockLabel>
      <ClockLabel residue={3} tone="faint">
        3
      </ClockLabel>
      <ClockLabel residue={5} tone="brass">
        5
      </ClockLabel>
      <ClockLabel residue={7} tone="brass">
        7
      </ClockLabel>
      <ClockLabel residue={11} tone="brass">
        11
      </ClockLabel>
    </svg>
  );
}

function Ray({
  residue,
  className,
  dashed = false,
}: {
  residue: number;
  className: string;
  dashed?: boolean;
}) {
  const a = polar(residue, RAY_INNER);
  const b = polar(residue, RAY_OUTER);
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      className={className}
      strokeDasharray={dashed ? "4 3" : undefined}
    />
  );
}

function ClockLabel({
  residue,
  tone,
  children,
}: {
  residue: number;
  tone: "brass" | "faint";
  children: string;
}) {
  const point = polar(residue, 208);
  return (
    <text
      x={point.x}
      y={point.y}
      textAnchor="middle"
      dominantBaseline="middle"
      className={tone === "brass" ? "fill-brass text-sm" : "fill-faint text-xs"}
    >
      {children}
    </text>
  );
}
