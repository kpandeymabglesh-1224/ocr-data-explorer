// server.js - the Express application.
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./db");
const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const tablesRouter = require("./routes/tables");
const statsRouter = require("./routes/stats");

const app = express();

// --- middleware -------------------------------------------------------
app.use(cors());            // lets the React app on port 5173 call this API
app.use(express.json());    // parses JSON request bodies
app.use(logger);            // our own request logger

// --- routes -----------------------------------------------------------
app.get("/api/health", function (req, res) {
    res.json({ status: "ok", message: "OCR Data Explorer API is running" });
});

app.use("/api/tables", tablesRouter);
app.use("/api/stats", statsRouter);

// --- error handling (must come last) ----------------------------------
app.use(notFound);
app.use(errorHandler);

// --- start ------------------------------------------------------------
const PORT = process.env.PORT || 5000;

connectDB()
    .then(function () {
        app.listen(PORT, function () {
            console.log("Server running at http://localhost:" + PORT);
        });
    })
    .catch(function (error) {
        console.log("Could not connect to MongoDB:", error.message);
        process.exit(1);
    });
