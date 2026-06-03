const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  console.error(
    `[errorHandler] ${req.method} ${req.originalUrl} -> ${statusCode}:`,
    err.message
  );
  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
