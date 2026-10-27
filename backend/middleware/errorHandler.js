// errorHandler.js - one place where every error becomes a JSON response.

// Runs when no route matched the URL.
function notFound(req, res, next) {
    res.status(404).json({ error: "Route not found: " + req.originalUrl });
}

// Runs when any route calls next(error) or throws.
// Express recognises this as an error handler because it takes four arguments.
function errorHandler(err, req, res, next) {
    console.log("Error:", err.message);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal server error" });
}

module.exports = { notFound, errorHandler };
