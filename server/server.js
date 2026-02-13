import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import middleware
import { globalLimiter } from './middleware/rateLimitMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import dishRoutes from './routes/dishRoutes.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Security Middleware
 */

// Helmet: Sets various HTTP headers for security
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow images to be loaded
}));

// CORS: Configure allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // In development, allow all origins (easier for testing with mobile/network IPs)
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        // In production, check against allowed origins
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin); // Log the blocked origin for debugging
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
app.use(globalLimiter);

/**
 * Static Files
 * Serve uploaded images
 */
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

/**
 * Routes
 */

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishRoutes);

// 404 handler - must be after all routes
app.use(notFound);

// Error handler - must be last
app.use(errorHandler);

/**
 * MongoDB Connection
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Options removed as they're now defaults in Mongoose 6+
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Start Server
 */
const startServer = async () => {
    // Connect to database first
    await connectDB();

    // Start listening
    const server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async () => {
        console.log('\nShutting down gracefully...');

        server.close(async () => {
            console.log('HTTP server closed');

            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed');
                process.exit(0);
            } catch (error) {
                console.error('Error during shutdown:', error);
                process.exit(1);
            }
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error('Forcing shutdown...');
            process.exit(1);
        }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

// Start the server
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default app;
