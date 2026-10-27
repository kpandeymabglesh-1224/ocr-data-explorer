// About.jsx - what the project is, and how this app is built. Useful for the viva.
import { useTables } from "../TablesContext.jsx";

function About() {
  const { tables } = useTables();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>About this project</h1>
          <p className="subtitle">The research behind the data, and how the app is built.</p>
        </div>
      </div>

      <div className="card">
        <h2>The research</h2>
        <p className="description">
          Transcribing handwriting by hand is the expensive part of building an OCR system.
          This study measures how the test character error rate falls as the number of
          human-transcribed training words grows, from 10 words up to 4000, and repeats the
          whole sweep under four training regimes: training from scratch, transferring a
          model pretrained on synthetic word images, transferring only the pretrained
          encoder, and pretraining with masked image modelling. Every point is the mean of
          six random seeds.
        </p>
        <p className="description">
          The curve is then inverted into the question a project lead actually asks: to
          reach a chosen error level, how many transcribed words does each regime need?
          Synthetic pretraining saves a large share of the transcription work when labels
          are scarce, and the saving shrinks as the budget grows. Masked image modelling
          was worse than training from scratch between 50 and 500 words, slightly better at
          10 words, and indistinguishable from scratch from 1000 words up.
        </p>
        <p className="muted small">
          Note on scope: the annotation-starved condition is constructed by subsampling a
          large transcribed pool, not found in the wild, and the intervals shown cover seed
          variation only.
        </p>
      </div>

      <div className="card">
        <h2>Source paper</h2>
        <p className="description">
          <strong>
            Measuring Annotation Efficiency for Handwritten Devanagari Recognition:
            Sample-Complexity Curves for Four Pretraining Regimes
          </strong>
          <br />
          Manglesh Kumar Pandey and Sumit Kumar Banshal &#183;{" "}
          <a href="https://arxiv.org/abs/2609.16859" target="_blank" rel="noreferrer">
            arXiv:2609.16859
          </a>
        </p>
        <p className="muted small">
          The nine tables in this app are the analysis outputs behind the paper&rsquo;s
          results, loaded into MongoDB unchanged.
        </p>
      </div>

      <div className="card">
        <h2>The four regimes, as named in the tables</h2>
        <dl className="fields">
          <div className="field-row">
            <dt>
              <code>scratch</code>
            </dt>
            <dd>Trained from random initialisation on the transcribed words only.</dd>
          </div>
          <div className="field-row">
            <dt>
              <code>synthsup</code>
            </dt>
            <dd>
              Supervised pretraining on synthetic word images, whole model transferred.
            </dd>
          </div>
          <div className="field-row">
            <dt>
              <code>synthenc</code>
            </dt>
            <dd>
              The same supervised pretraining, but only the encoder is transferred. This
              separates which pretext task was used from how much of the network moved.
            </dd>
          </div>
          <div className="field-row">
            <dt>
              <code>mim</code>
            </dt>
            <dd>Masked image modelling pretraining, encoder transferred.</dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <h2>How the app is built</h2>
        <pre className="routes">
{`React (Vite)  http://localhost:5173
     |
     |  fetch()
     v
Express        http://localhost:5000
     |
     |  mongodb driver
     v
MongoDB        mongodb://127.0.0.1:27017/ocr_project`}
        </pre>
        <ul className="bullets">
          <li>
            <strong>Frontend:</strong> React with Vite, React Router for the three pages,
            useState and useEffect for data loading, useContext to share the table list and
            useRef to move focus to the search box.
          </li>
          <li>
            <strong>Backend:</strong> Express with CORS, a JSON body parser, a custom
            request logger, a validation layer driven by the column definitions and one
            central error handler.
          </li>
          <li>
            <strong>Database:</strong> MongoDB through the official driver, one collection
            per table, loaded from the study&rsquo;s CSV output files by{" "}
            <code>npm run seed</code>.
          </li>
          <li>
            <strong>Charts:</strong> drawn as plain SVG from a MongoDB aggregation, with no
            charting library.
          </li>
        </ul>
      </div>

      <div className="card">
        <h2>Collections in the database</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Collection</th>
              <th scope="col">What it holds</th>
              <th scope="col" className="num">
                Documents
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.map(function (t) {
              return (
                <tr key={t.key}>
                  <td className="num">{t.number}</td>
                  <td>
                    <code>{t.collection}</code>
                  </td>
                  <td>{t.title}</td>
                  <td className="num">{t.rowCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default About;
