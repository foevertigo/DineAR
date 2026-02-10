import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Middleware Configurations
 * Implements OWASP rate limiting best practices to prevent:
 * - Brute force attacks
 * - DoS attacks
 * - API abuse
 * 
 * All limits include:
 * - IP-based tracking
 * - Graceful 429 responses
 * - Retry-After headers
 */

/**
 * Global rate limiter: Applied to all requests
 * Default: 100 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many requests, please slow down',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Strict limiter for authentication endpoints
 * Prevents brute force attacks on login/signup
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
    skipSuccessfulRequests: false, // Count all requests, even successful ones
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later'
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many authentication attempts, please try again in 15 minutes',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Moderate limiter for dish endpoints
 * Prevents API abuse while allowing normal usage
 * 30 requests per 15 minutes per IP
 */
export const dishLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.DISH_RATE_LIMIT_MAX) || 30,
    message: {
        success: false,
        error: 'Too many requests to dish endpoints, please try again later'
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Rate limit exceeded for dish operations',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Create a custom rate limiter with user-based tracking
 * Tracks by user ID if authenticated, IP otherwise
 * Useful for protecting resource-intensive operations
 */
export const createUserLimiter = (windowMs, max) => {
    return rateLimit({
        windowMs,
        max,
        keyGenerator: (req) => {
            // Use user ID if authenticated, otherwise use IP
            return req.user?.userId || req.ip;
        },
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
            });
        }
    });
};
