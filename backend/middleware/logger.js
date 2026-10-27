// logger.js - prints one line per request, with how long it took.
function logger(req, res, next) {
    const startedAt = Date.now();

    res.on("finish", function () {
        const ms = Date.now() - startedAt;
        console.log(
            req.method + " " + req.originalUrl + " -> " + res.statusCode + " (" + ms + " ms)"
        );
    });

    next();
}

module.exports = logger;
