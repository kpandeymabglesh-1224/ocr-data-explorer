// Dashboard.jsx - the landing page: four figures and the curve.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, getJSON } from "../api";
import CerChart from "../components/CerChart.jsx";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(function () {
    getJSON(API_BASE + "/stats")
      .then(function (result) {
        setStats(result);
        setError("");
      })
      .catch(function (err) {
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div className="page">
        <p className="error">Could not reach the API: {error}</p>
        <p className="muted">
          Check that the Express server is running on port 5000 and that the database has
          been seeded.
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const k = stats.kpis;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Data efficiency of handwritten Devanagari OCR</h1>
          <p className="subtitle">
            Four training regimes, nine label budgets, six seeds each. Served from Express
            and MongoDB.
          </p>
        </div>
        <Link className="btn primary" to="/tables">
          Browse the tables
        </Link>
      </div>

      <div className="kpis">
        <div className="card kpi">
          <span className="kpi-label">Run documents</span>
          <span className="kpi-value">{k.runs}</span>
          <span className="muted small">in the runs collection</span>
        </div>
        <div className="card kpi">
          <span className="kpi-label">Tables served</span>
          <span className="kpi-value">{k.tables}</span>
          <span className="muted small">one collection each</span>
        </div>
        <div className="card kpi">
          <span className="kpi-label">Best test CER</span>
          <span className="kpi-value accent">
            {k.bestCer === null ? "—" : k.bestCer}
          </span>
          <span className="muted small">
            {k.bestArm} at {k.bestN} words
          </span>
        </div>
        <div className="card kpi">
          <span className="kpi-label">Label multiplier</span>
          <span className="kpi-value accent">
            {k.headlineMultiplier === null ? "—" : k.headlineMultiplier + "×"}
          </span>
          <span className="muted small">
            at CER {k.headlineTarget} &#183; [{k.headlineLo}, {k.headlineHi}]
          </span>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Test error against the number of transcribed words</h2>
          <code className="mono-tag">GET /api/stats</code>
        </div>
        <CerChart series={stats.series} />
      </div>

      <div className="card">
        <h2>What the headline number means</h2>
        <p className="description">
          To reach a character error rate of {k.headlineTarget}, a model trained from
          scratch needs about {k.headlineBaselineN} transcribed words, while the
          synthetically pretrained model needs about {k.headlineArmN}. That is the{" "}
          {k.headlineMultiplier}&#215; figure above. The saving is largest when labels are
          scarce and shrinks as the budget grows: by 4000 words the four regimes are close
          together.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
