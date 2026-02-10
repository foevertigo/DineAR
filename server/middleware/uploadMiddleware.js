import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import fs from 'fs';

/**
 * File Upload Middleware using Multer
 * 
 * Security features:
 * - File type validation (images only)
 * - File size limit (5MB)
 * - Unique filename generation
 * - Safe storage location
 */

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Configure storage
 * - Destination: uploads/ directory
 * - Filename: timestamp-nanoid-original.ext
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-nanoid.ext
        const uniqueId = nanoid(10);
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${timestamp}-${uniqueId}${ext}`;
        cb(null, filename);
    }
});

/**
 * File filter: Only allow image files
 * Prevents upload of malicious file types
 */
const fileFilter = (req, file, cb) => {
    // Allowed MIME types
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed'), false);
    }
};

/**
 * Multer configuration
 */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
        files: 1 // Only one file at a time
    }
});

/**
 * Middleware to handle single image upload
 * Field name: 'image'
 */
export const uploadImage = upload.single('image');

/**
 * Middleware to clean up uploaded file on error
 * Should be used after upload middleware
 */
export const cleanupOnError = (err, req, res, next) => {
    // If there's an error and a file was uploaded, delete it
    if (err && req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) {
                console.error('Failed to delete file:', unlinkErr);
            }
        });
    }
    next(err);
};

/**
 * Helper function to delete a file
 * Used when deleting dish records
 */
export const deleteFile = (filename) => {
    if (!filename) return;

    const filepath = path.join(uploadDir, path.basename(filename));

    fs.unlink(filepath, (err) => {
        if (err) {
            console.error('Failed to delete file:', err);
        }
    });
};

/**
 * Helper function to get public URL for uploaded file
 */
export const getFileUrl = (req, filename) => {
    if (!filename) return null;
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};
