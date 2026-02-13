import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    try {
        console.log('🔌 Attempting to connect to MongoDB...');
        console.log('📍 Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//*****@') || 'mongodb://localhost:27017/dinear');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dinear');

        console.log('\n✅ MongoDB connection successful!');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('🔢 Port:', mongoose.connection.port);

        await mongoose.disconnect();
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ MongoDB connection failed!');
        console.error('Error:', error.message);
        console.error('\n📝 Troubleshooting:');
        console.error('  1. Make sure MongoDB is running: net start MongoDB');
        console.error('  2. Check MONGODB_URI in server/.env');
        console.error('  3. Verify MongoDB is installed: mongod --version');
        process.exit(1);
    }
};

testConnection();
