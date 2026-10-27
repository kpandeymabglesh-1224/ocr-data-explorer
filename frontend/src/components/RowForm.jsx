// RowForm.jsx - the add / edit form. The inputs are built from the same
// column definitions the table headers come from.
import { useState } from "react";

function buildInitialValues(columns, initial) {
  const values = {};
  columns.forEach(function (col) {
    let value = initial ? initial[col.field] : "";
    if (value === null || value === undefined) {
      value = col.type === "boolean" ? false : "";
    }
    values[col.field] = value;
  });
  return values;
}

function RowForm({ columns, initial, saving, onCancel, onSubmit }) {
  const [values, setValues] = useState(function () {
    return buildInitialValues(columns, initial);
  });
  const [localErrors, setLocalErrors] = useState([]);

  function handleChange(col, event) {
    const next = { ...values };
    next[col.field] = col.type === "boolean" ? event.target.checked : event.target.value;
    setValues(next);
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Client-side check first; the server validates again.
    const errors = [];
    columns.forEach(function (col) {
      const value = values[col.field];
      if (col.required && (value === "" || value === null || value === undefined)) {
        errors.push(col.field + " is required.");
      }
      if (col.type === "number" && value !== "" && isNaN(Number(value))) {
        errors.push(col.field + " must be a number.");
      }
    });

    setLocalErrors(errors);
    if (errors.length === 0) {
      onSubmit(values);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3>{initial ? "Edit document" : "Add a document"}</h3>

      {localErrors.length > 0 && (
        <ul className="error-list">
          {localErrors.map(function (message) {
            return <li key={message}>{message}</li>;
          })}
        </ul>
      )}

      <div className="form-grid">
        {columns.map(function (col) {
          const inputId = "field-" + col.field;
          return (
            <div className="field" key={col.field}>
              <label htmlFor={inputId}>
                {col.label}
                {col.required && <span className="req-star"> *</span>}
              </label>
              {col.type === "boolean" ? (
                <input
                  id={inputId}
                  type="checkbox"
                  checked={Boolean(values[col.field])}
                  onChange={function (event) {
                    handleChange(col, event);
                  }}
                />
              ) : (
                <input
                  id={inputId}
                  type={col.type === "number" ? "number" : "text"}
                  step="any"
                  value={values[col.field]}
                  onChange={function (event) {
                    handleChange(col, event);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add document"}
        </button>
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default RowForm;
