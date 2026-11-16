export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`
    });
  };
  
  export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
    const message =
      err.code === 11000
        ? 'An account or record with this value already exists.'
        : err.message || 'Internal Server Error';
  
    res.status(statusCode).json({
      success: false,
      message,
      errors: err.errors || []
    });
  };