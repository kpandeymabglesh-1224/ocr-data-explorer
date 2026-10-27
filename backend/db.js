// db.js - one MongoDB connection, shared by every route file.
const { MongoClient } = require("mongodb");
require("dotenv").config();

// A clear message beats the driver's error if the .env file is missing or the
// command was run from the wrong folder.
if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
    console.log(
        "MONGODB_URI or DB_NAME is missing. Run npm commands from inside the " +
        "backend folder, and check that backend/.env exists."
    );
    process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
let db = null;

async function connectDB() {
    if (db) {
        return db;
    }
    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log("MongoDB connected successfully");
    console.log("Database:", db.databaseName);
    return db;
}

function getDB() {
    if (!db) {
        throw new Error("Database not connected. Call connectDB() first.");
    }
    return db;
}

module.exports = { connectDB, getDB, client };
