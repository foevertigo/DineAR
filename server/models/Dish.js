import mongoose from 'mongoose';

/**
 * Dish Schema
 * - Linked to user via userId reference
 * - Validates plate size enum
 * - Stores image and model URLs
 * - Includes indexes for performance
 */
const dishSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true // Index for faster queries by user
        },
        name: {
            type: String,
            required: [true, 'Dish name is required'],
            trim: true,
            maxlength: [100, 'Dish name must be less than 100 characters'],
            minlength: [1, 'Dish name cannot be empty']
        },
        plateSize: {
            type: String,
            required: [true, 'Plate size is required'],
            enum: {
                values: ['small', 'medium', 'large'],
                message: 'Plate size must be small, medium, or large'
            },
            default: 'medium'
        },
        thumbnailUrl: {
            type: String,
            default: null
        },
        modelUrl: {
            type: String,
            default: null
        },
        qrUrl: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt
    }
);

// Compound index for efficient sorting by user and creation date
dishSchema.index({ userId: 1, createdAt: -1 });

/**
 * Static method to get user's dishes with pagination
 * @param {string} userId - User's MongoDB ObjectId
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated results with dishes and metadata
 */
dishSchema.statics.getUserDishes = async function (userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [dishes, total] = await Promise.all([
        this.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(), // Use lean() for better performance (returns plain objects)
        this.countDocuments({ userId })
    ]);

    return {
        dishes,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

const Dish = mongoose.model('Dish', dishSchema);

export default Dish;
