import { round2, type Survey } from "@/lib/number-geometry";

const LANES = [11, 1, 5, 7] as const;
const LANE_ROW = ["row-start-1", "row-start-2", "row-start-3", "row-start-4"] as const;

function laneY(residue: number) {
  const index = LANES.indexOf(residue as (typeof LANES)[number]);
  return 12.5 + index * 25;
}

type Props = {
  survey: Survey;
  horizon: number;
  selected: number;
};

export function Spectrograph({ survey, horizon, selected }: Props) {
  const xOf = (p: number) => round2((p / horizon) * 1000);
  const ticks = survey.primes.filter((prime) => {
    if (prime <= 3) return false;
    const residue = prime % 12;
    return residue === 1 || residue === 5 || residue === 7 || residue === 11;
  });

  return (
    <div className="grid h-40 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] grid-rows-4">
      {LANES.map((lane, index) => (
        <div
          key={lane}
          className={`col-start-1 flex items-center justify-end text-sm text-brass tabular-nums ${LANE_ROW[index]}`}
        >
          {lane}
        </div>
      ))}
      {LANES.map((lane, index) => (
        <div
          key={`count-${lane}`}
          className={`col-start-3 flex items-center pl-2 text-xs text-faint tabular-nums ${LANE_ROW[index]}`}
        >
          {survey.railCount[lane]}
        </div>
      ))}
      <svg
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Spectrograph of primes up to ${horizon} on rails 11, 1, 5, and 7. Bridges are twin chords.`}
        className="col-start-2 row-span-4 row-start-1 h-full w-full"
      >
        {LANES.map((lane) => (
          <line
            key={lane}
            x1={0}
            x2={1000}
            y1={laneY(lane)}
            y2={laneY(lane)}
            className="stroke-line stroke-1"
          />
        ))}
        {survey.twins.map((twin) => {
          if (twin.channel === "3-5") return null;
          const hot = twin.p === 5 || twin.p === selected || twin.q === selected;
          return (
            <line
              key={`${twin.p}-${twin.q}`}
              x1={xOf(twin.p)}
              y1={laneY(twin.p % 12)}
              x2={xOf(twin.q)}
              y2={laneY(twin.q % 12)}
              className={hot ? "stroke-brass stroke-2" : "stroke-brass stroke-1 opacity-45"}
            />
          );
        })}
        {ticks.map((prime) => (
          <line
            key={prime}
            x1={xOf(prime)}
            x2={xOf(prime)}
            y1={laneY(prime % 12) - 3.2}
            y2={laneY(prime % 12) + 3.2}
            className={prime === selected ? "stroke-paper stroke-2" : "stroke-brass stroke-1"}
          />
        ))}
        <line
          x1={xOf(selected)}
          x2={xOf(selected)}
          y1={2}
          y2={98}
          className="stroke-paper stroke-1 opacity-70"
        />
      </svg>
    </div>
  );
}
