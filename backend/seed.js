// seed.js - reads the CSV files in ./data and loads them into MongoDB.
// Run once with:  npm run seed
const fs = require("fs");
const path = require("path");
const { connectDB, client } = require("./db");
const { tables } = require("./tableConfig");

// --- a very small CSV reader -------------------------------------------
// Splits one line into cells, respecting "quoted, cells".
function splitLine(line) {
    const cells = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
            cells.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    cells.push(current.trim());
    return cells;
}

// Turns the whole file into an array of plain objects.
// Lines starting with # are comments in these files, so they are skipped.
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(function (line) {
        return line.trim() !== "" && line.trim().charAt(0) !== "#";
    });

    const header = splitLine(lines[0]);

    return lines.slice(1).map(function (line) {
        const cells = splitLine(line);
        const row = {};
        header.forEach(function (name, i) {
            row[name] = cells[i] === undefined ? "" : cells[i];
        });
        return row;
    });
}

// Converts each cell to the type declared in tableConfig.js.
function convertRow(table, rawRow) {
    const doc = {};

    table.columns.forEach(function (col) {
        const raw = rawRow[col.field];

        if (raw === undefined || raw === "") {
            doc[col.field] = null;
            return;
        }
        if (col.type === "number") {
            const num = Number(raw.replace("+", ""));
            doc[col.field] = isNaN(num) ? null : num;
        } else if (col.type === "boolean") {
            doc[col.field] = raw.toLowerCase() === "true";
        } else {
            doc[col.field] = raw;
        }
    });

    return doc;
}

async function seed() {
    try {
        const db = await connectDB();

        for (const table of tables) {
            const filePath = path.join(__dirname, "data", table.csv);
            const text = fs.readFileSync(filePath, "utf8");
            const rows = parseCSV(text).map(function (raw) {
                return convertRow(table, raw);
            });

            const collection = db.collection(table.collection);
            await collection.deleteMany({});
            await collection.insertMany(rows);

            console.log(
                "Loaded " + rows.length + " documents into '" + table.collection + "'"
            );
        }

        console.log("Seeding finished.");
    } catch (error) {
        console.log("Seeding failed:", error.message);
    } finally {
        await client.close();
    }
}

// Only run the seeding when this file is executed directly (npm run seed),
// so the helpers above can also be imported by a test script.
if (require.main === module) {
    seed();
}

module.exports = { parseCSV, splitLine, convertRow, seed };
