// routes/tables.js - every table in the app is served by these five routes.
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db");
const { tables, getTable } = require("../tableConfig");
const validateRow = require("../middleware/validateRow");

const router = express.Router();

// Small helper: find the table config named in the URL, or fail with 404.
function requireTable(req, res, next) {
    const table = getTable(req.params.key);
    if (!table) {
        return res.status(404).json({ error: "No table named '" + req.params.key + "'" });
    }
    req.table = table;
    next();
}

// Small helper: turn the :id in the URL into a MongoDB ObjectId.
function toObjectId(id) {
    if (!ObjectId.isValid(id)) {
        const err = new Error("'" + id + "' is not a valid document id.");
        err.status = 400;
        throw err;
    }
    return new ObjectId(id);
}

// GET /api/tables
// The list that fills the dropdown: number, key, title and row count.
router.get("/", async function (req, res, next) {
    try {
        const db = getDB();
        const list = [];

        for (const table of tables) {
            const count = await db.collection(table.collection).countDocuments();
            list.push({
                key: table.key,
                number: table.number,
                title: table.title,
                collection: table.collection,
                description: table.description,
                rowCount: count
            });
        }

        res.json(list);
    } catch (error) {
        next(error);
    }
});

// GET /api/tables/:key?page=1&limit=15&sort=arm&order=asc&q=synth
// The selected table: its description, its column definitions and one page of rows.
router.get("/:key", requireTable, async function (req, res, next) {
    try {
        const db = getDB();
        const table = req.table;

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
        const order = req.query.order === "desc" ? -1 : 1;

        // Only allow sorting by a column that actually exists.
        const sortField = table.columns.some(function (col) {
            return col.field === req.query.sort;
        })
            ? req.query.sort
            : null;

        // Free-text search across the text columns of this table.
        let filter = {};
        const q = (req.query.q || "").trim();
        if (q !== "") {
            const textColumns = table.columns.filter(function (col) {
                return col.type === "string";
            });
            if (textColumns.length > 0) {
                filter = {
                    $or: textColumns.map(function (col) {
                        const condition = {};
                        condition[col.field] = { $regex: q, $options: "i" };
                        return condition;
                    })
                };
            }
        }

        const collection = db.collection(table.collection);
        const total = await collection.countDocuments(filter);

        let cursor = collection.find(filter);
        if (sortField) {
            const sortSpec = {};
            sortSpec[sortField] = order;
            cursor = cursor.sort(sortSpec);
        }
        const rows = await cursor.skip((page - 1) * limit).limit(limit).toArray();

        res.json({
            key: table.key,
            number: table.number,
            title: table.title,
            collection: table.collection,
            description: table.description,
            columns: table.columns,
            rows: rows,
            page: page,
            limit: limit,
            total: total,
            totalPages: Math.max(1, Math.ceil(total / limit))
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/tables/:key - add one document.
router.post("/:key", requireTable, async function (req, res, next) {
    try {
        const check = validateRow(req.table, req.body);
        if (!check.valid) {
            return res.status(400).json({ error: "Validation failed", details: check.errors });
        }

        const result = await getDB()
            .collection(req.table.collection)
            .insertOne(check.document);

        res.status(201).json({
            message: "Document inserted successfully",
            insertedId: result.insertedId
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/tables/:key/:id - replace the fields of one document.
router.put("/:key/:id", requireTable, async function (req, res, next) {
    try {
        const check = validateRow(req.table, req.body);
        if (!check.valid) {
            return res.status(400).json({ error: "Validation failed", details: check.errors });
        }

        const result = await getDB()
            .collection(req.table.collection)
            .updateOne({ _id: toObjectId(req.params.id) }, { $set: check.document });

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "No document with id " + req.params.id });
        }

        res.json({
            message: "Document updated successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/tables/:key/:id - remove one document.
router.delete("/:key/:id", requireTable, async function (req, res, next) {
    try {
        const result = await getDB()
            .collection(req.table.collection)
            .deleteOne({ _id: toObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "No document with id " + req.params.id });
        }

        res.json({ message: "Document deleted successfully", deletedCount: result.deletedCount });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
