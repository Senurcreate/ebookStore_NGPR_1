/**
 * Simple storage service using public Google Drive links
 * NO API needed - works with any public Google Drive link
 */
class SimpleStorageService {
    constructor() {
        console.log('📚 Simple Storage Service initialized (No API needed)');
    }

    /**
     * Extract file ID from Google Drive URL (works with any public link)
     */
    extractFileId(url) {
        if (!url) return null;
        
        // Clean the URL
        url = url.trim();
        
        // Common Google Drive URL patterns
        const patterns = [
            /\/d\/([a-zA-Z0-9_-]{33})/,           // /d/FILE_ID_33chars
            /id=([a-zA-Z0-9_-]{33})/,             // ?id=FILE_ID
            /\/file\/d\/([a-zA-Z0-9_-]{33})/,     // /file/d/FILE_ID
            /^([a-zA-Z0-9_-]{33})$/,              // Just the file ID
            /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/, // /open?id=FILE_ID
            /\/uc\?export=download&id=([a-zA-Z0-9_-]+)/      // /uc?export=download&id=FILE_ID
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return null;
    }

    /**
     * Generate direct download link from any Google Drive URL
     */
    generateDownloadLink(originalUrl) {
        const fileId = this.extractFileId(originalUrl);
        
        if (!fileId) {
            // If we can't extract file ID, return the original URL
            return originalUrl;
        }
        
        // Standard Google Drive direct download link
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    /**
     * Generate preview/embed link
     */
    generatePreviewLink(originalUrl) {
        const fileId = this.extractFileId(originalUrl);
        
        if (!fileId) {
            return originalUrl;
        }
        
        // Google Drive embed viewer
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    /**
     * Generate HTML embed code for iframe
     */
    generateEmbedCode(originalUrl, width = '100%', height = '600px') {
        const previewUrl = this.generatePreviewLink(originalUrl);
        
        return `<iframe 
            src="${previewUrl}" 
            width="${width}" 
            height="${height}"
            style="border: none;"
            allow="autoplay"
        ></iframe>`;
    }

    /**
     * Get file info (simulated - no API call)
     */
    getFileInfo(originalUrl) {
        const fileId = this.extractFileId(originalUrl);
        
        if (!fileId) {
            return {
                error: 'Invalid Google Drive URL'
            };
        }
        
        return {
            fileId: fileId,
            downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
            previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
            embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
            directUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
            isPublic: true,
            note: 'Using public Google Drive link (no API needed)'
        };
    }

    /**
     * Validate if URL looks like a Google Drive link
     */
    isValidDriveUrl(url) {
        if (!url) return false;
        
        return url.includes('drive.google.com') || 
               this.extractFileId(url) !== null;
    }

    /**
     * Simulate download with time window (handled in app logic, not Drive)
     */
    checkDownloadWindow(purchaseTime, windowHours = 24) {
        const now = new Date();
        const purchaseDate = new Date(purchaseTime);
        const hoursPassed = (now - purchaseDate) / (1000 * 60 * 60);
        
        return {
            canDownload: hoursPassed <= windowHours,
            hoursPassed: Math.floor(hoursPassed),
            hoursRemaining: Math.max(0, windowHours - hoursPassed),
            expiresAt: new Date(purchaseDate.getTime() + (windowHours * 60 * 60 * 1000))
        };
    }
}

// Create singleton
const storageService = new SimpleStorageService();

module.exports = storageService;