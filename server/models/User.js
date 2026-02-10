import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema
 * - Email is unique and validated
 * - Password is hashed before saving using bcrypt
 * - Includes methods for password comparison
 */
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: [255, 'Email must be less than 255 characters'],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false // Don't include password in queries by default
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt
    }
);

/**
 * Pre-save hook: Hash password before saving to database
 * Only hashes if password is modified or new
 */
userSchema.pre('save', async function (next) {
    // Only hash if password was modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password (cost factor: 12)
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Method to compare candidate password with hashed password
 * @param {string} candidatePassword - Plain text password to check
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Transform output: Remove password from JSON responses
 */
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
