const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join(', ');
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  // MongoDB Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value for: ${field}`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Zod validation (if it reaches here unhandled)
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    return res.status(statusCode).json({
      error: 'Validation Error',
      message,
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
  });
};

module.exports = errorHandler;
