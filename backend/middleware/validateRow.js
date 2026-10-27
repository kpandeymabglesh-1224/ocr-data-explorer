// validateRow.js - checks a document sent by the client against the column
// definitions in tableConfig.js, before it is written to MongoDB.
// Returns { valid, errors, document }.

function validateRow(table, body) {
    const errors = [];
    const document = {};

    if (!body || typeof body !== "object") {
        return { valid: false, errors: ["Request body must be a JSON object."], document: {} };
    }

    table.columns.forEach(function (col) {
        const value = body[col.field];
        const isEmpty = value === undefined || value === null || value === "";

        if (isEmpty) {
            if (col.required) {
                errors.push(col.field + " is required.");
            } else {
                document[col.field] = null;
            }
            return;
        }

        if (col.type === "number") {
            const num = Number(value);
            if (isNaN(num)) {
                errors.push(col.field + " must be a number.");
            } else {
                document[col.field] = num;
            }
        } else if (col.type === "boolean") {
            document[col.field] = value === true || value === "true";
        } else {
            document[col.field] = String(value);
        }
    });

    // Reject anything that is not a declared column, so the collection stays tidy.
    Object.keys(body).forEach(function (name) {
        if (name === "_id") {
            return;
        }
        const known = table.columns.some(function (col) {
            return col.field === name;
        });
        if (!known) {
            errors.push("Unknown field: " + name);
        }
    });

    return { valid: errors.length === 0, errors: errors, document: document };
}

module.exports = validateRow;
