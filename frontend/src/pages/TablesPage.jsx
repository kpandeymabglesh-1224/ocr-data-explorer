// TablesPage.jsx - the main screen. One table at a time, chosen from the
// dropdown. Nothing is shown until a table is selected.
import { useEffect, useRef, useState } from "react";
import { API_BASE, getJSON, sendJSON } from "../api";
import { useTables } from "../TablesContext.jsx";
import DataTable from "../components/DataTable.jsx";
import RowForm from "../components/RowForm.jsx";

const PAGE_SIZE = 12;

function TablesPage() {
  const { tables, loading: tablesLoading, error: tablesError } = useTables();

  const [selectedKey, setSelectedKey] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  // useRef: after a new table is chosen, put the cursor in the search box.
  const searchRef = useRef(null);

  // Load the rows of the selected table whenever the selection, the page,
  // the sort or the search text changes.
  useEffect(
    function () {
      if (!selectedKey) {
        setData(null);
        return;
      }

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      if (search.trim() !== "") {
        params.set("q", search.trim());
      }
      if (sortField !== "") {
        params.set("sort", sortField);
        params.set("order", sortOrder);
      }

      setLoading(true);
      getJSON(API_BASE + "/tables/" + selectedKey + "?" + params.toString())
        .then(function (result) {
          setData(result);
          setError("");
        })
        .catch(function (err) {
          setError(err.message);
          setData(null);
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [selectedKey, page, search, sortField, sortOrder, notice]
  );

  function handleSelect(event) {
    setSelectedKey(event.target.value);
    setPage(1);
    setSearch("");
    setSortField("");
    setSortOrder("asc");
    setFormOpen(false);
    setEditingRow(null);
    setError("");
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function startAdd() {
    setEditingRow(null);
    setFormOpen(true);
  }

  function startEdit(row) {
    setEditingRow(row);
    setFormOpen(true);
  }

  async function handleSubmit(values) {
    setSaving(true);
    setError("");
    try {
      if (editingRow) {
        await sendJSON(
          API_BASE + "/tables/" + selectedKey + "/" + editingRow._id,
          "PUT",
          values
        );
        setNotice("Document updated at " + new Date().toLocaleTimeString());
      } else {
        await sendJSON(API_BASE + "/tables/" + selectedKey, "POST", values);
        setNotice("Document added at " + new Date().toLocaleTimeString());
      }
      setFormOpen(false);
      setEditingRow(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    const ok = window.confirm("Delete this document? This cannot be undone.");
    if (!ok) {
      return;
    }
    try {
      await sendJSON(API_BASE + "/tables/" + selectedKey + "/" + row._id, "DELETE");
      setNotice("Document deleted at " + new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    }
  }

  const selectedMeta = tables.find(function (t) {
    return t.key === selectedKey;
  });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Result tables</h1>
          <p className="subtitle">
            Nine tables from the OCR data-efficiency study. Pick one to load it from the API.
          </p>
        </div>
      </div>

      {/* ---- the selection menu ---- */}
      <div className="card selector">
        <div className="field">
          <label htmlFor="table-select">Choose a table</label>
          <select
            id="table-select"
            value={selectedKey}
            onChange={handleSelect}
            disabled={tablesLoading}
          >
            <option value="">-- select a table --</option>
            {tables.map(function (t) {
              return (
                <option key={t.key} value={t.key}>
                  {"Table " + t.number + " — " + t.title + " (" + t.rowCount + " rows)"}
                </option>
              );
            })}
          </select>
        </div>

        <div className="field">
          <label htmlFor="table-search">Search in this table</label>
          <input
            id="table-search"
            type="search"
            ref={searchRef}
            value={search}
            onChange={handleSearchChange}
            placeholder="e.g. synthsup"
            disabled={!selectedKey}
          />
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={startAdd}
          disabled={!selectedKey}
        >
          + Add document
        </button>
      </div>

      {tablesError && <p className="error">Could not load the table list: {tablesError}</p>}
      {error && <p className="error">{error}</p>}

      {!selectedKey && !tablesLoading && (
        <div className="card empty">
          <p>No table selected yet.</p>
          <p className="muted">
            Use the dropdown above. Each table is fetched on demand from
            <code> GET /api/tables/&lt;key&gt;</code>, so only the one you pick is loaded.
          </p>
        </div>
      )}

      {selectedKey && (
        <div className="split">
          <div className="split-main">
            {loading && <p className="muted">Loading…</p>}

            {data && (
              <>
                <div className="card">
                  <div className="card-head">
                    <h2>
                      Table {data.number} &#183; {data.title}
                    </h2>
                    <code className="mono-tag">{data.collection}</code>
                  </div>
                  <p className="description">{data.description}</p>
                </div>

                {formOpen && (
                  <RowForm
                    columns={data.columns}
                    initial={editingRow}
                    saving={saving}
                    onCancel={function () {
                      setFormOpen(false);
                      setEditingRow(null);
                    }}
                    onSubmit={handleSubmit}
                  />
                )}

                <div className="card table-card">
                  <DataTable
                    columns={data.columns}
                    rows={data.rows}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />

                  <div className="pager">
                    <span className="muted">
                      {data.total === 0
                        ? "No matching documents"
                        : "Showing " +
                          ((data.page - 1) * data.limit + 1) +
                          "–" +
                          Math.min(data.page * data.limit, data.total) +
                          " of " +
                          data.total}
                    </span>
                    <span className="pager-buttons">
                      <button
                        type="button"
                        className="btn"
                        onClick={function () {
                          setPage(page - 1);
                        }}
                        disabled={data.page <= 1}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={function () {
                          setPage(page + 1);
                        }}
                        disabled={data.page >= data.totalPages}
                      >
                        Next
                      </button>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ---- the table description panel ---- */}
          <aside className="split-side">
            {data && (
              <div className="card">
                <h3>Field descriptions</h3>
                <dl className="fields">
                  {data.columns.map(function (col) {
                    return (
                      <div className="field-row" key={col.field}>
                        <dt>
                          <code>{col.field}</code>
                          <span className="type">{col.type}</span>
                          {col.required && <span className="req">required</span>}
                        </dt>
                        <dd>{col.description}</dd>
                      </div>
                    );
                  })}
                </dl>

                <h3 className="routes-head">Routes used by this page</h3>
                <pre className="routes">
{`GET    /api/tables
GET    /api/tables/${selectedKey}
POST   /api/tables/${selectedKey}
PUT    /api/tables/${selectedKey}/:id
DELETE /api/tables/${selectedKey}/:id`}
                </pre>
                {selectedMeta && (
                  <p className="muted small">
                    Collection <code>{selectedMeta.collection}</code> currently holds{" "}
                    {selectedMeta.rowCount} documents as of page load.
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default TablesPage;
