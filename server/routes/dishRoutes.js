import express from 'express';
import QRCode from 'qrcode';
import Dish from '../models/Dish.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import {
    validateDish,
    validateObjectId,
    sanitizeFields
} from '../middleware/validationMiddleware.js';
import { dishLimiter } from '../middleware/rateLimitMiddleware.js';
import {
    uploadImage,
    cleanupOnError,
    deleteFile,
    getFileUrl
} from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/dishes
 * @desc    Get all dishes for authenticated user (paginated)
 * @access  Private
 */
router.get(
    '/',
    authenticate,
    dishLimiter,
    asyncHandler(async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page

        const result = await Dish.getUserDishes(req.user.userId, page, limit);

        res.json({
            success: true,
            data: result
        });
    })
);

/**
 * @route   GET /api/dishes/:id
 * @desc    Get single dish by ID (public for AR viewing)
 * @access  Public (but optional auth for ownership check)
 */
router.get(
    '/:id',
    validateObjectId('id'),
    optionalAuth,
    asyncHandler(async (req, res) => {
        const dish = await Dish.findById(req.params.id);

        if (!dish) {
            return res.status(404).json({
                success: false,
                error: 'Dish not found'
            });
        }

        res.json({
            success: true,
            data: { dish }
        });
    })
);

/**
 * @route   POST /api/dishes
 * @desc    Create new dish with image upload
 * @access  Private
 */
router.post(
    '/',
    authenticate,
    dishLimiter,
    uploadImage,
    cleanupOnError,
    sanitizeFields(['name', 'plateSize']),
    validateDish,
    asyncHandler(async (req, res) => {
        const { name, plateSize = 'medium' } = req.body;

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Image is required'
            });
        }

        // Get public URL for uploaded image
        const imageUrl = getFileUrl(req, req.file.filename);

        // Generate QR code for AR viewing
        const arUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/ar`;
        let qrUrl = null;

        // Create dish
        const dish = await Dish.create({
            userId: req.user.userId,
            name,
            plateSize,
            thumbnailUrl: imageUrl,
            modelUrl: imageUrl, // In MVP, use same image; later replace with 3D model
            qrUrl
        });

        // Generate QR code and update dish (done asynchronously)
        try {
            const dishArUrl = `${arUrl}/${dish._id}`;
            qrUrl = await QRCode.toDataURL(dishArUrl);
            dish.qrUrl = qrUrl;
            await dish.save();
        } catch (error) {
            console.error('QR code generation error:', error);
            // Don't fail the request if QR generation fails
        }

        res.status(201).json({
            success: true,
            data: { dish }
        });
    })
);

/**
 * @route   PUT /api/dishes/:id
 * @desc    Update dish
 * @access  Private (owner only)
 */
router.put(
    '/:id',
    authenticate,
    dishLimiter,
    validateObjectId('id'),
    uploadImage,
    cleanupOnError,
    sanitizeFields(['name', 'plateSize']),
    asyncHandler(async (req, res) => {
        const dish = await Dish.findById(req.params.id);

        if (!dish) {
            return res.status(404).json({
                success: false,
                error: 'Dish not found'
            });
        }

        // Check ownership
        if (dish.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this dish'
            });
        }

        // Update fields
        if (req.body.name) dish.name = req.body.name;
        if (req.body.plateSize) dish.plateSize = req.body.plateSize;

        // If new image uploaded, delete old one and update URL
        if (req.file) {
            // Delete old image file
            if (dish.thumbnailUrl) {
                const oldFilename = dish.thumbnailUrl.split('/').pop();
                deleteFile(oldFilename);
            }

            const imageUrl = getFileUrl(req, req.file.filename);
            dish.thumbnailUrl = imageUrl;
            dish.modelUrl = imageUrl;
        }

        await dish.save();

        res.json({
            success: true,
            data: { dish }
        });
    })
);

/**
 * @route   DELETE /api/dishes/:id
 * @desc    Delete dish
 * @access  Private (owner only)
 */
router.delete(
    '/:id',
    authenticate,
    dishLimiter,
    validateObjectId('id'),
    asyncHandler(async (req, res) => {
        const dish = await Dish.findById(req.params.id);

        if (!dish) {
            return res.status(404).json({
                success: false,
                error: 'Dish not found'
            });
        }

        // Check ownership
        if (dish.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this dish'
            });
        }

        // Delete associated image file
        if (dish.thumbnailUrl) {
            const filename = dish.thumbnailUrl.split('/').pop();
            deleteFile(filename);
        }

        // Delete dish from database
        await dish.deleteOne();

        res.json({
            success: true,
            message: 'Dish deleted successfully'
        });
    })
);

export default router;
