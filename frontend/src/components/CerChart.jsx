// CerChart.jsx - a small SVG line chart, drawn by hand so the project needs
// no charting library. One line per training regime.

const COLOURS = {
  scratch: "#4a5568",
  synthsup: "#b45309",
  synthenc: "#1d4e89",
  mim: "#8f2f2f"
};

const LABELS = {
  scratch: "from scratch",
  synthsup: "synthetic pretraining (full)",
  synthenc: "synthetic pretraining (encoder)",
  mim: "masked image modelling"
};

const WIDTH = 760;
const HEIGHT = 300;
const PAD = { left: 52, right: 14, top: 14, bottom: 34 };

const N_MIN = 10;
const N_MAX = 4000;

function xFor(n) {
  const span = Math.log10(N_MAX) - Math.log10(N_MIN);
  const frac = (Math.log10(n) - Math.log10(N_MIN)) / span;
  return PAD.left + frac * (WIDTH - PAD.left - PAD.right);
}

// CER 0 sits at the bottom of the plot and CER 1 at the top, so a falling
// line means the error is going down.
function yFor(cer) {
  return PAD.top + (1 - cer) * (HEIGHT - PAD.top - PAD.bottom);
}

function CerChart({ series }) {
  if (!series || series.length === 0) {
    return <p className="muted">No chart data.</p>;
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xTicks = [10, 25, 50, 100, 250, 500, 1000, 2000, 4000];

  return (
    <div>
      <svg
        viewBox={"0 0 " + WIDTH + " " + HEIGHT}
        width="100%"
        role="img"
        aria-label="Test character error rate against the number of transcribed training words, one line per training regime"
      >
        {yTicks.map(function (tick) {
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={yFor(tick)}
                x2={WIDTH - PAD.right}
                y2={yFor(tick)}
                stroke="#e2e0d9"
              />
              <text
                x={PAD.left - 8}
                y={yFor(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#6b6960"
              >
                {tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        {xTicks.map(function (tick) {
          return (
            <text
              key={tick}
              x={xFor(tick)}
              y={HEIGHT - 12}
              textAnchor="middle"
              fontSize="11"
              fill="#6b6960"
            >
              {tick}
            </text>
          );
        })}

        {series.map(function (line) {
          const points = line.points
            .filter(function (p) {
              return p.n >= N_MIN && p.n <= N_MAX && p.cer !== null;
            })
            .map(function (p) {
              return xFor(p.n) + "," + yFor(p.cer);
            })
            .join(" ");

          return (
            <polyline
              key={line.arm}
              points={points}
              fill="none"
              stroke={COLOURS[line.arm] || "#333333"}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>

      <ul className="legend">
        {series.map(function (line) {
          return (
            <li key={line.arm}>
              <span
                className="swatch"
                style={{ background: COLOURS[line.arm] || "#333333" }}
              />
              {LABELS[line.arm] || line.arm}
            </li>
          );
        })}
      </ul>
      <p className="muted small">
        Horizontal axis: number of human-transcribed training words (log scale). Vertical
        axis: mean test character error rate over 6 seeds. Lower is better.
      </p>
    </div>
  );
}

export default CerChart;
