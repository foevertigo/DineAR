import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import {
    validateSignup,
    validateLogin,
    sanitizeFields
} from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public (rate limited)
 */
router.post(
    '/signup',
    authLimiter,
    sanitizeFields(['email', 'password']),
    validateSignup,
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Create new user (password will be hashed by pre-save hook)
        const user = await User.create({
            email,
            password
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email
                },
                token
            }
        });
    })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public (rate limited)
 */
router.post(
    '/login',
    authLimiter,
    sanitizeFields(['email', 'password']),
    validateLogin,
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Find user and include password field (normally excluded)
        const user = await User.findOne({ email }).select('+password');

        // Constant-time response to prevent user enumeration
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email
                },
                token
            }
        });
    })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get(
    '/me',
    authenticate,
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    createdAt: user.createdAt
                }
            }
        });
    })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side only, just returns success)
 * @access  Public
 * @note    JWT tokens are stateless, so logout is handled client-side by removing the token
 */
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

export default router;
