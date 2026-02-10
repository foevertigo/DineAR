import { body, param, validationResult } from 'express-validator';

/**
 * Validation Middleware using express-validator
 * Implements OWASP input validation best practices:
 * - Whitelist validation (only allow expected fields)
 * - Type checking
 * - Length limits
 * - Format validation
 * - Sanitization to prevent XSS
 */

/**
 * Middleware to check validation results and return errors
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

/**
 * Email validation rules
 * - Must be valid email format
 * - Max 255 characters
 * - Normalized and sanitized
 */
export const validateEmail = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters')
        .normalizeEmail()
        .escape() // Prevent XSS
];

/**
 * Password validation rules
 * - Minimum 8 characters
 * - Maximum 128 characters (prevent DoS via large inputs)
 * - Must contain at least one letter and one number
 */
export const validatePassword = [
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage('Password must contain at least one letter and one number')
];

/**
 * Signup validation: Email + Password
 */
export const validateSignup = [
    ...validateEmail,
    ...validatePassword,
    validate
];

/**
 * Login validation: Email + Password (less strict on password format)
 */
export const validateLogin = [
    ...validateEmail,
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ max: 128 })
        .withMessage('Invalid password'),
    validate
];

/**
 * Dish creation/update validation
 * - Name: 1-100 characters, sanitized
 * - Plate size: enum validation
 */
export const validateDish = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Dish name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Dish name must be between 1 and 100 characters')
        .escape(), // Prevent XSS

    body('plateSize')
        .optional()
        .trim()
        .isIn(['small', 'medium', 'large'])
        .withMessage('Plate size must be small, medium, or large'),

    validate
];

/**
 * MongoDB ObjectId validation
 * Validates URL parameters that should be valid MongoDB ObjectIds
 */
export const validateObjectId = (paramName = 'id') => [
    param(paramName)
        .trim()
        .isMongoId()
        .withMessage('Invalid ID format'),
    validate
];

/**
 * Pagination validation
 * Ensures page and limit are positive integers within reasonable bounds
 */
export const validatePagination = [
    body('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Page must be a positive integer (max 1000)'),

    body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    validate
];

/**
 * Sanitize object to only allow whitelisted fields
 * Prevents mass assignment vulnerabilities
 */
export const sanitizeFields = (allowedFields) => {
    return (req, res, next) => {
        if (req.body) {
            const sanitized = {};
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    sanitized[field] = req.body[field];
                }
            });
            req.body = sanitized;
        }
        next();
    };
};
