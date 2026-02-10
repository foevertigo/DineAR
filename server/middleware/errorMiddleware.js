/**
 * Centralized Error Handling Middleware
 * 
 * Provides consistent error responses and prevents
 * sensitive information leakage in production
 */

/**
 * 404 Not Found Handler
 * Catches all requests that don't match any routes
 */
export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    });
};

/**
 * Global Error Handler
 * Handles all errors thrown in the application
 * Returns appropriate status codes and safe error messages
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });

    // Default error
    let status = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation failed';
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));

        return res.status(status).json({
            success: false,
            error: message,
            details: errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        status = 409;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists`;

        return res.status(status).json({
            success: false,
            error: message
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';

        return res.status(status).json({
            success: false,
            error: message
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        status = 401;
        message = 'Invalid token';

        return res.status(status).json({
            success: false,
            error: message
        });
    }

    if (err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Token expired';

        return res.status(status).json({
            success: false,
            error: message
        });
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        status = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size too large (max 5MB)';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field';
        } else {
            message = 'File upload error';
        }

        return res.status(status).json({
            success: false,
            error: message
        });
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && status === 500) {
        message = 'Internal server error';
    }

    res.status(status).json({
        success: false,
        error: message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates need for try-catch blocks in every route
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
