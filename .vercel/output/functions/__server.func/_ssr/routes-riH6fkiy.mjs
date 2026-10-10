import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ChevronLeft, i as ChevronRight, n as Play, r as Pause } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-riH6fkiy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var OCTATONIC = [
	1,
	2,
	4,
	5,
	7,
	8,
	10,
	11
];
var OCTATONIC_EVEN = [
	2,
	4,
	8,
	10
];
/** Just perfect fifth, in octaves. Irrational, so the orbit never closes. */
var FIFTH = Math.log2(3 / 2);
/** 12 fifths − 7 octaves = 531441/524288. */
var COMMA_CENTS = 1200 * Math.log2(531441 / 524288);
function channelOf(p) {
	const r = p % 12;
	if (r === 3) return "3-5";
	if (r === 5) return "5-7";
	if (r === 11) return "11-1";
	return null;
}
function survey(limit) {
	const flag = new Uint8Array(limit + 1);
	flag.fill(1);
	if (limit >= 0) flag[0] = 0;
	if (limit >= 1) flag[1] = 0;
	for (let i = 2; i * i <= limit; i++) {
		if (!flag[i]) continue;
		for (let j = i * i; j <= limit; j += i) flag[j] = 0;
	}
	const primes = [];
	const railCount = {
		1: 0,
		5: 0,
		7: 0,
		11: 0
	};
	for (let n = 2; n <= limit; n++) {
		if (!flag[n]) continue;
		primes.push(n);
		if (n > 3) {
			const r = n % 12;
			if (r === 1 || r === 5 || r === 7 || r === 11) railCount[r] += 1;
		}
	}
	const twins = [];
	const channelCount = {
		"3-5": 0,
		"5-7": 0,
		"11-1": 0
	};
	for (const p of primes) {
		if (p + 2 > limit || !flag[p + 2]) continue;
		const channel = channelOf(p);
		if (!channel) continue;
		twins.push({
			p,
			q: p + 2,
			channel
		});
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
		isPrime: (n) => n >= 0 && n <= limit && flag[n] === 1
	};
}
function phase(k) {
	const turns = k * FIFTH;
	const frac = turns - Math.floor(turns);
	return {
		frac,
		cents: Math.min(frac, 1 - frac) * 1200,
		et: (7 * k % 12 + 12) % 12
	};
}
function recurrenceRails(maxK) {
	let best = Infinity;
	const rails = [];
	for (let k = 1; k <= maxK; k++) {
		const { cents } = phase(k);
		if (cents < best - 1e-6) {
			best = cents;
			rails.push({
				k,
				cents
			});
		}
	}
	return rails;
}
function radiusAt(p, horizon, inner, outer) {
	const t = Math.log(p) / Math.log(horizon);
	return inner + Math.min(1, Math.max(0, t)) * (outer - inner);
}
function round2(value) {
	return Math.round(value * 100) / 100;
}
function formatCents(cents) {
	if (cents >= 100) return cents.toFixed(0);
	if (cents >= 40) return cents.toFixed(1);
	return cents.toFixed(2);
}
var CX = 240;
var CY = 240;
var RAY_INNER = 72;
var RAY_OUTER = 156;
var DISK = 56;
var TRI = 32;
function polar(residue, radius) {
	const theta = -Math.PI / 2 + residue / 12 * Math.PI * 2;
	return {
		x: round2(CX + radius * Math.cos(theta)),
		y: round2(CY + radius * Math.sin(theta))
	};
}
function arcPath(radius, fromRes, toRes) {
	const a = polar(fromRes, radius);
	const b = polar(toRes, radius);
	const large = ((toRes - fromRes) % 12 + 12) % 12 > 6 ? 1 : 0;
	return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}
function PhaseFigure({ survey, horizon, selected, flowK, showLadder, showOctatonic, showFold, showFifths, onHover, onPin }) {
	const bead = (p) => polar(p % 12, radiusAt(p, horizon, RAY_INNER, RAY_OUTER));
	const plotted = survey.primes.filter((p) => p === 3 || p > 3);
	const now = phase(flowK);
	const just = polar(now.frac * 12, 182);
	const tempered = polar(now.et, 182);
	const commaEnd = COMMA_CENTS / 1200 * 12;
	const tri = [
		0,
		1,
		2
	].map((residue) => {
		const theta = -Math.PI / 2 + residue / 3 * Math.PI * 2;
		return {
			x: round2(CX + TRI * Math.cos(theta)),
			y: round2(CY + TRI * Math.sin(theta))
		};
	});
	const members = [
		selected - 2,
		selected,
		selected + 2
	];
	const octagon = OCTATONIC.map((residue, index) => {
		const point = polar(residue, 164);
		return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 480 480",
		role: "img",
		"aria-label": `Mod 12 clock with prime rails at 1, 5, 7, and 11. Prime ${selected} is marked. The wedge at 0 is the Pythagorean comma.`,
		className: "h-auto w-full overflow-visible font-mono",
		onPointerLeave: () => onHover(null),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: CX,
				cy: CY,
				r: 170,
				className: "fill-none stroke-line stroke-1"
			}),
			Array.from({ length: 12 }, (_, residue) => {
				if (residue === 1 || residue === 5 || residue === 7 || residue === 11 || residue === 3) return null;
				const a = polar(residue, residue === 0 ? 158 : 164);
				const b = polar(residue, residue === 0 ? 178 : 176);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: a.x,
					y1: a.y,
					x2: b.x,
					y2: b.y,
					className: residue === 0 ? "stroke-brass stroke-1" : "stroke-faint stroke-1"
				}, residue);
			}),
			showOctatonic && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `${octagon} Z`,
				className: "fill-none stroke-faint stroke-1"
			}), OCTATONIC_EVEN.map((residue) => {
				const point = polar(residue, 164);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: point.x,
					cy: point.y,
					r: 2.4,
					className: "fill-ink stroke-faint stroke-1"
				}, residue);
			})] }),
			showFifths && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: arcPath(190, 0, commaEnd),
				className: "fill-none stroke-brass stroke-2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ray, {
				residue: 3,
				className: "stroke-faint stroke-1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ray, {
				residue: 1,
				className: "stroke-brass stroke-1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ray, {
				residue: 5,
				className: "stroke-brass stroke-2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ray, {
				residue: 7,
				className: "stroke-brass stroke-1",
				dashed: showFold
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ray, {
				residue: 11,
				className: "stroke-brass stroke-1",
				dashed: showFold
			}),
			survey.twins.map((twin) => {
				const emblem = twin.p === 3 || twin.p === 5;
				if (!emblem && !showLadder) return null;
				const a = bead(twin.p);
				const b = bead(twin.q);
				const hot = twin.p === selected || twin.q === selected;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: a.x,
					y1: a.y,
					x2: b.x,
					y2: b.y,
					className: emblem || hot ? "stroke-brass stroke-2" : "stroke-brass stroke-1 opacity-35"
				}, `${twin.p}-${twin.q}`);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: CX,
				cy: CY,
				r: DISK,
				className: "fill-ink stroke-line stroke-1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: `M ${tri[0].x.toFixed(2)} ${tri[0].y.toFixed(2)} L ${tri[1].x.toFixed(2)} ${tri[1].y.toFixed(2)} L ${tri[2].x.toFixed(2)} ${tri[2].y.toFixed(2)} Z`,
				className: "fill-none stroke-line stroke-1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: tri[0].x - 7,
				y: tri[0].y - 7,
				width: 14,
				height: 14,
				transform: `rotate(45 ${tri[0].x} ${tri[0].y})`,
				className: "fill-ink stroke-brass stroke-1"
			}),
			members.map((value) => {
				const point = tri[(value % 3 + 3) % 3];
				const prime = value > 1 && survey.isPrime(value);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: point.x,
					cy: point.y,
					r: prime ? 3.4 : 2.5,
					className: prime ? "fill-brass" : "fill-none stroke-faint stroke-1"
				}, value);
			}),
			plotted.map((prime) => {
				const point = bead(prime);
				const on = prime === selected;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
					prime === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: point.x,
						cy: point.y,
						r: 8,
						className: "fill-none stroke-brass stroke-1"
					}),
					on && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: point.x,
						cy: point.y,
						r: 5.5,
						className: "fill-none stroke-paper stroke-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: point.x,
						cy: point.y,
						r: prime === 3 ? 3 : 2.6,
						className: prime === 3 ? "fill-ink stroke-brass stroke-2" : "fill-brass"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: point.x,
						cy: point.y,
						r: 10,
						className: "cursor-pointer fill-transparent",
						onPointerEnter: () => onHover(prime),
						onClick: () => onPin(prime),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: prime })
					})
				] }, prime);
			}),
			showFifths && flowK <= 18 ? Array.from({ length: flowK }, (_, index) => {
				const step = index + 1;
				const point = polar(phase(step).frac * 12, round2(174 + step / 12 * 14));
				const last = step === flowK;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: point.x,
					cy: point.y,
					r: last ? 3.4 : 1.7,
					className: "fill-brass",
					opacity: last ? 1 : .55
				}, step);
			}) : null,
			showFifths && flowK > 18 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: just.x,
				cy: just.y,
				r: 3.4,
				className: "fill-brass"
			}) : null,
			showFifths && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: tempered.x,
				cy: tempered.y,
				r: 5,
				className: "fill-ink stroke-paper stroke-1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockLabel, {
				residue: 0,
				tone: "faint",
				children: "0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockLabel, {
				residue: 1,
				tone: "brass",
				children: "1"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockLabel, {
				residue: 3,
				tone: "faint",
				children: "3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockLabel, {
				residue: 5,
				tone: "brass",
				children: "5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockLabel, {
				residue: 7,
				tone: "brass",
				children: "7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockLabel, {
				residue: 11,
				tone: "brass",
				children: "11"
			})
		]
	});
}
function Ray({ residue, className, dashed = false }) {
	const a = polar(residue, RAY_INNER);
	const b = polar(residue, RAY_OUTER);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
		x1: a.x,
		y1: a.y,
		x2: b.x,
		y2: b.y,
		className,
		strokeDasharray: dashed ? "4 3" : void 0
	});
}
function ClockLabel({ residue, tone, children }) {
	const point = polar(residue, 208);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
		x: point.x,
		y: point.y,
		textAnchor: "middle",
		dominantBaseline: "middle",
		className: tone === "brass" ? "fill-brass text-sm" : "fill-faint text-xs",
		children
	});
}
var LANES = [
	11,
	1,
	5,
	7
];
var LANE_ROW = [
	"row-start-1",
	"row-start-2",
	"row-start-3",
	"row-start-4"
];
function laneY(residue) {
	return 12.5 + LANES.indexOf(residue) * 25;
}
function Spectrograph({ survey, horizon, selected }) {
	const xOf = (p) => round2(p / horizon * 1e3);
	const ticks = survey.primes.filter((prime) => {
		if (prime <= 3) return false;
		const residue = prime % 12;
		return residue === 1 || residue === 5 || residue === 7 || residue === 11;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid h-40 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] grid-rows-4",
		children: [
			LANES.map((lane, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `col-start-1 flex items-center justify-end text-sm text-brass tabular-nums ${LANE_ROW[index]}`,
				children: lane
			}, lane)),
			LANES.map((lane, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `col-start-3 flex items-center pl-2 text-xs text-faint tabular-nums ${LANE_ROW[index]}`,
				children: survey.railCount[lane]
			}, `count-${lane}`)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 1000 100",
				preserveAspectRatio: "none",
				role: "img",
				"aria-label": `Spectrograph of primes up to ${horizon} on rails 11, 1, 5, and 7. Bridges are twin chords.`,
				className: "col-start-2 row-span-4 row-start-1 h-full w-full",
				children: [
					LANES.map((lane) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: 0,
						x2: 1e3,
						y1: laneY(lane),
						y2: laneY(lane),
						className: "stroke-line stroke-1"
					}, lane)),
					survey.twins.map((twin) => {
						if (twin.channel === "3-5") return null;
						const hot = twin.p === 5 || twin.p === selected || twin.q === selected;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
							x1: xOf(twin.p),
							y1: laneY(twin.p % 12),
							x2: xOf(twin.q),
							y2: laneY(twin.q % 12),
							className: hot ? "stroke-brass stroke-2" : "stroke-brass stroke-1 opacity-45"
						}, `${twin.p}-${twin.q}`);
					}),
					ticks.map((prime) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: xOf(prime),
						x2: xOf(prime),
						y1: laneY(prime % 12) - 3.2,
						y2: laneY(prime % 12) + 3.2,
						className: prime === selected ? "stroke-paper stroke-2" : "stroke-brass stroke-1"
					}, prime)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: xOf(selected),
						x2: xOf(selected),
						y1: 2,
						y2: 98,
						className: "stroke-paper stroke-1 opacity-70"
					})
				]
			})
		]
	});
}
function Instrument() {
	const [horizon, setHorizon] = (0, import_react.useState)(180);
	const [pinned, setPinned] = (0, import_react.useState)(5);
	const [hover, setHover] = (0, import_react.useState)(null);
	const [flowK, setFlowK] = (0, import_react.useState)(12);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [showLadder, setShowLadder] = (0, import_react.useState)(false);
	const [showOctatonic, setShowOctatonic] = (0, import_react.useState)(true);
	const [showFold, setShowFold] = (0, import_react.useState)(true);
	const [showFifths, setShowFifths] = (0, import_react.useState)(true);
	const data = (0, import_react.useMemo)(() => survey(horizon), [horizon]);
	const rails = (0, import_react.useMemo)(() => recurrenceRails(700), []);
	const primes = data.primes.filter((prime) => prime >= 3);
	const shown = hover != null && hover <= horizon ? hover : pinned;
	const stepNow = phase(flowK);
	(0, import_react.useEffect)(() => {
		if (!playing) return;
		const id = window.setInterval(() => {
			setFlowK((k) => k >= 700 ? 0 : k + 1);
		}, 420);
		return () => window.clearInterval(id);
	}, [playing]);
	function setHorizonSafe(next) {
		setHorizon(next);
		setHover(null);
		setPinned((current) => current <= next ? current : 5);
	}
	function stepPrime(direction) {
		const index = primes.indexOf(pinned);
		const next = primes[index + direction];
		if (next == null) return;
		setHover(null);
		setPinned(next);
	}
	function jumpFifth(k) {
		setShowFifths(true);
		setPlaying(false);
		setFlowK(k);
	}
	const left = shown - 2;
	const right = shown + 2;
	const leftTwin = left > 1 && data.isPrime(left) && data.isPrime(shown);
	const rightTwin = data.isPrime(shown) && data.isPrime(right);
	const both = leftTwin && rightTwin;
	const forced = [
		left,
		shown,
		right
	].find((value) => value % 3 === 0) ?? left;
	const pair = leftTwin ? `${left}–${shown}` : `${shown}–${right}`;
	const factor = forced > 3 ? `${forced} is divisible by 3 and larger than 3, so that vertex is composite.` : `${forced} is divisible by 3.`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-line pb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-brass uppercase",
					children: "Mod 12 · twin phase lock"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl leading-none text-balance text-paper sm:text-5xl",
						children: "Fifth Intersection"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm leading-relaxed text-pretty text-faint",
						children: "The only prime that belongs to two twin pairs, drawn on the clock where those pairs can live."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-baseline justify-between text-xs text-faint",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Horizon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-paper tabular-nums",
							children: horizon
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 36,
						max: 960,
						step: 12,
						value: horizon,
						"aria-valuetext": `Primes through ${horizon}`,
						onChange: (event) => setHorizonSafe(Number(event.target.value)),
						className: "mt-2 h-11 w-full"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TransportButton, {
							pressed: playing,
							onClick: () => setPlaying((value) => !value),
							children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), playing ? "Pause fifths" : "Play fifths"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransportButton, {
							onClick: () => {
								setShowFifths(true);
								setFlowK((k) => k >= 700 ? 0 : k + 1);
							},
							children: "Step"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransportButton, {
							onClick: () => jumpFifth(12),
							children: "Comma"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerButton, {
							pressed: showLadder,
							onClick: () => setShowLadder((value) => !value),
							children: "Twin chords"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerButton, {
							pressed: showOctatonic,
							onClick: () => setShowOctatonic((value) => !value),
							children: "Octatonic"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerButton, {
							pressed: showFold,
							onClick: () => setShowFold((value) => !value),
							children: "Mod 6"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayerButton, {
							pressed: showFifths,
							onClick: () => setShowFifths((value) => !value),
							children: "Fifths"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "min-w-0 border border-line bg-ink p-3 sm:p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						tabIndex: 0,
						onKeyDown: (event) => {
							if (event.key === "ArrowRight") {
								stepPrime(1);
								event.preventDefault();
							}
							if (event.key === "ArrowLeft") {
								stepPrime(-1);
								event.preventDefault();
							}
						},
						className: "outline-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhaseFigure, {
							survey: data,
							horizon,
							selected: shown,
							flowK,
							showLadder,
							showOctatonic,
							showFold,
							showFifths,
							onHover: setHover,
							onPin: (prime) => {
								setHover(null);
								setPinned(prime);
							}
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-faint",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block size-2 rounded-full bg-brass" }), "Prime on a rail"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-px w-4 bg-brass" }), "Twin chord"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block size-2 rounded-full border border-brass" }), "3, the only prime off the rails"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block size-2 rotate-45 border border-brass" }), "Square vertex is divisible by 3"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-px w-4 border-t border-dashed border-brass" }), "Dashed ray: same class mod 6, opposite side"]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex min-w-0 flex-col gap-5 border border-line bg-panel p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
										label: "Previous prime",
										onClick: () => stepPrime(-1),
										disabled: primes[0] === pinned,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-5xl leading-none text-brass tabular-nums",
											children: shown
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-faint tabular-nums",
											children: [
												"≡ ",
												shown % 12,
												" mod 12 · ≡ ",
												shown % 6,
												" mod 6"
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
										label: "Next prime",
										onClick: () => stepPrime(1),
										disabled: primes[primes.length - 1] === pinned,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-4 text-sm leading-relaxed ${both ? "text-brass" : "text-paper"}`,
								children: both ? "Intersection. Both neighbors are prime — the only time this happens." : "Not an intersection. One neighbor fails."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-pretty text-faint",
								children: both ? `${left}, ${shown}, and ${right} cover every residue mod 3. The multiple of 3 is ${forced} itself, so it is still prime. No later triple has that escape.` : leftTwin || rightTwin ? `${factor} One chord remains, ${pair}. An intersection needs both.` : `${factor} Neither neighbor is prime.`
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2 text-center",
							children: [
								left,
								shown,
								right
							].map((value) => {
								const prime = value > 1 && data.isPrime(value);
								const mid = value === shown;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border border-line px-2 py-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-faint tabular-nums",
											children: [value % 3, " mod 3"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `mt-1 font-display text-2xl leading-none tabular-nums ${prime ? mid ? "text-brass" : "text-paper" : "text-faint line-through"}`,
											children: value
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-faint",
											children: prime ? "prime" : value > 3 && value % 3 === 0 ? "÷ 3" : "composite"
										})
									]
								}, value);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-2 gap-x-4 gap-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
									label: "Shared vertices",
									value: data.intersections,
									emphasize: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
									label: "Chords 5–7",
									value: data.channelCount["5-7"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
									label: "Chords 11–1",
									value: data.channelCount["11-1"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Count, {
									label: "Chord 3–5",
									value: data.channelCount["3-5"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl text-paper",
									children: "Recurrence rails"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-faint tabular-nums",
									children: [
										"step ",
										flowK,
										flowK === 12 ? " · comma" : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-faint tabular-nums",
								children: [
									"Just fifth is ",
									formatCents(stepNow.cents),
									"¢ from unison. Tempered residue ",
									stepNow.et,
									". Comma ",
									formatCents(COMMA_CENTS),
									"¢ = 531441/524288."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex flex-col",
								children: rails.map((rail) => {
									const active = rail.k === flowK;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => jumpFifth(rail.k),
										"aria-pressed": active,
										className: `flex h-11 items-center justify-between gap-3 border-b border-line px-1 text-left text-sm tabular-nums ${active ? "text-brass" : "text-paper"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [rail.k, " fifths"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-faint",
												children: rail.k === 12 ? "comma" : "return"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [formatCents(rail.k === 12 ? COMMA_CENTS : rail.cents), "¢"] })
										]
									}, rail.k);
								})
							})
						] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 border border-line p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl text-paper",
							children: "Rail spectrograph"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-faint",
							children: [
								"Ticks are primes. Staples are twin chords. Cursor is ",
								shown,
								"."
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spectrograph, {
						survey: data,
						horizon,
						selected: shown
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] text-xs text-faint tabular-nums",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: horizon })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 grid gap-6 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reading, {
						title: "Rails",
						children: "Every prime past 3 stands on 1, 5, 7, or 11 mod 12 — the units of this clock. As pitch-classes they are the odd whole-tone scale after 3 and 9 are removed, and they sit in exactly one octatonic mode: 1, 2, 4, 5, 7, 8, 10, 11. The even notes of that mode are the open dots. The sieve of 2 already killed them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reading, {
						title: "Mod 6 fold",
						children: "The dashed diameters are the collapse: 7 ≡ 1 and 11 ≡ 5 mod 6. So the list 1, 5, 7, 11 is not four classes mod 6. It is the mod-12 splitting of the only two legal classes. Twin primes past 3 are always a 5 followed by a 1, mod 6 — here, the bottom fan (5, 7) and the top fan (11, 1)."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reading, {
						title: "Why the intersection is unique",
						children: "p−2, p, and p+2 meet every residue mod 3, so one of them is divisible by 3. The only prime divisible by 3 is 3. The triple (3, 5, 7) is therefore the only one, and 5 is the only shared vertex: the chord from 3 meets the chord to 7 there. The center triangle is that argument. Its square vertex is the one forced to be 0 mod 3. Step the prime and watch that vertex go hollow."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reading, {
						title: "Comma, then recurrence",
						children: "A just fifth turns the octave by log₂(3/2), which is irrational, so the orbit is dense and comes arbitrarily close to unison again. Twelve fifths miss seven octaves by the Pythagorean comma, the wedge at 0. The open ring is equal temperament, which pretends the wedge is shut. Each row under recurrence rails is a record approach — Poincaré return, not a closer comma. Click a row to park the fifth there."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reading, {
						title: "Projection, not serotonin",
						children: "A dot-product attention score keeps the part of a vector that lies along a query. Landing on a rail is the same kind of act: the integer is kept only as its coordinate on this clock. That is the parallel. It does not say anything about serotonin, or about how a nervous system integrates space."
					})
				]
			})
		]
	});
}
function Count({ label, value, emphasize = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-faint",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: `text-right tabular-nums ${emphasize ? "text-brass" : "text-paper"}`,
		children: value
	})] });
}
function Reading({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-xl text-paper",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-sm leading-relaxed text-pretty text-faint",
		children
	})] });
}
function TransportButton({ children, onClick, pressed = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": pressed,
		onClick,
		className: `inline-flex h-11 items-center gap-2 border px-3 text-sm ${pressed ? "border-brass bg-panel text-brass" : "border-line bg-panel text-paper"}`,
		children
	});
}
function LayerButton({ children, pressed, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": pressed,
		onClick,
		className: `inline-flex h-11 items-center border px-3 text-sm ${pressed ? "border-brass text-brass" : "border-line text-faint"}`,
		children
	});
}
function IconButton({ children, label, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		disabled,
		className: "inline-flex size-11 items-center justify-center border border-line text-paper disabled:opacity-40",
		children
	});
}
var SplitComponent = Instrument;
//#endregion
export { SplitComponent as component };
