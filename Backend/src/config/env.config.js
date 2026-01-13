const path = require('path');
const fs = require('fs');

// Load .env from project root
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('✅ .env loaded from:', envPath);
} else {
    console.warn('⚠️  .env file not found at:', envPath);
    // Use default values
}

const config = {
    googleDrive: {
        useMock: true, // Always use mock for now
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'
    },
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    database: {
        url: process.env.DB_URL || 'mongodb://localhost:27017/ebookstore'
    }
};

module.exports = config;