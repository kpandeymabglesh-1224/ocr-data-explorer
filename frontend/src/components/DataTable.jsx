// DataTable.jsx - draws whatever columns the API sent, so the same component
// works for all nine tables.

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

function DataTable({ columns, rows, sortField, sortOrder, onSort, onEdit, onDelete }) {
  if (!rows || rows.length === 0) {
    return <p className="muted padded">No documents to show.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(function (col) {
              const active = sortField === col.field;
              return (
                <th key={col.field} scope="col">
                  <button
                    type="button"
                    className={active ? "sort active" : "sort"}
                    onClick={function () {
                      onSort(col.field);
                    }}
                    title={col.description}
                  >
                    {col.label}
                    {active && <span>{sortOrder === "asc" ? " ↑" : " ↓"}</span>}
                  </button>
                </th>
              );
            })}
            <th scope="col" className="actions-head">
              actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(function (row) {
            return (
              <tr key={row._id}>
                {columns.map(function (col) {
                  const isNumber = col.type === "number";
                  return (
                    <td key={col.field} className={isNumber ? "num" : ""}>
                      {formatValue(row[col.field])}
                    </td>
                  );
                })}
                <td className="actions">
                  <button
                    type="button"
                    className="btn small"
                    onClick={function () {
                      onEdit(row);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn small danger"
                    onClick={function () {
                      onDelete(row);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
