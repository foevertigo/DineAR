import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * 
 * Security features:
 * - Validates JWT signature
 * - Checks token expiration
 * - Verifies user still exists
 * - Prevents timing attacks with consistent error messages
 */
export const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header (Bearer <token>)
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Verify token signature and decode payload
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            // Token is invalid or expired
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        // Verify user still exists in database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Attach user to request for use in route handlers
        req.user = {
            userId: user._id.toString(),
            email: user.email
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        // Don't expose internal errors to client
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

/**
 * Optional Authentication Middleware
 * Attempts to authenticate but doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated vs anonymous users
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Continue without authentication
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user) {
            req.user = {
                userId: user._id.toString(),
                email: user.email
            };
        }

        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};
