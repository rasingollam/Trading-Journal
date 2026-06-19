export function errorHandler(err, _req, res, _next) {
    console.error("Unhandled error:", err);
    const message = err.message || "Internal Server Error";
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ error: message });
}
//# sourceMappingURL=error-handler.js.map