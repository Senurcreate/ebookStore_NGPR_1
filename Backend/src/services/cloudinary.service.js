const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
    /**
     * Upload file to Cloudinary
     * @param {Object} file - File object from multer
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload result
     */
    static async uploadFile(file, options = {}) {
        try {
            const uploadOptions = {
                resource_type: options.resourceType || 'auto',
                folder: options.folder || 'ebookstore',
                ...options
            };

            // For audio files, set resource_type to 'video' (Cloudinary treats audio as video)
            if (file.mimetype.startsWith('audio/')) {
                uploadOptions.resource_type = 'video';
            }

            // For PDF files
            if (file.mimetype === 'application/pdf') {
                uploadOptions.resource_type = 'auto';
            }

            const result = await cloudinary.uploader.upload(file.path, uploadOptions);
            
            return {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                bytes: result.bytes,
                duration: result.duration || 0,
                resourceType: result.resource_type
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    /**
     * Generate secure download URL
     * @param {String} publicId - Cloudinary public ID
     * @param {Object} options - Transformation options
     * @returns {String} Secure URL
     */
    static generateDownloadUrl(publicId, options = {}) {
        const transformOptions = {
            flags: 'attachment',
            ...options
        };

        return cloudinary.url(publicId, transformOptions);
    }

    /**
     * Generate preview URL (for ebooks - first few pages)
     * @param {String} publicId - Cloudinary public ID
     * @param {Object} options - Transformation options
     * @returns {String} Preview URL
     */
    static generatePreviewUrl(publicId, options = {}) {
        const transformOptions = {
            pages: '1-20', // First 20 pages for PDFs
            ...options
        };

        return cloudinary.url(publicId, transformOptions);
    }

    /**
     * Generate audio sample URL
     * @param {String} publicId - Cloudinary public ID
     * @param {Number} sampleMinutes - Sample duration in minutes
     * @returns {String} Sample URL
     */
    static generateAudioSampleUrl(publicId, sampleMinutes = 5) {
        const sampleSeconds = sampleMinutes * 60;
        
        return cloudinary.url(publicId, {
            resource_type: 'video',
            end_offset: sampleSeconds,
            flags: 'splice'
        });
    }

    /**
     * Delete file from Cloudinary
     * @param {String} publicId - Cloudinary public ID
     * @returns {Promise<Object>} Delete result
     */
    static async deleteFile(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return {
                success: result.result === 'ok',
                result: result.result
            };
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            throw new Error(`Delete failed: ${error.message}`);
        }
    }

    /**
     * Validate Cloudinary URL
     * @param {String} url - URL to validate
     * @returns {Boolean} True if valid Cloudinary URL
     */
    static isValidCloudinaryUrl(url) {
        if (!url) return false;
        return url.startsWith('https://res.cloudinary.com/');
    }

    /**
     * Extract public ID from Cloudinary URL
     * @param {String} url - Cloudinary URL
     * @returns {String} Public ID
     */
    static extractPublicId(url) {
        if (!this.isValidCloudinaryUrl(url)) return null;
        
        const match = url.match(/res\.cloudinary\.com\/[^\/]+\/(?:video|image|raw)\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
        return match ? match[1] : null;
    }

    /**
     * Get file information from Cloudinary
     * @param {String} publicId - Cloudinary public ID
     * @returns {Promise<Object>} File info
     */
    static async getFileInfo(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId);
            return {
                url: result.secure_url,
                format: result.format,
                bytes: result.bytes,
                duration: result.duration || 0,
                resourceType: result.resource_type,
                createdAt: result.created_at,
                width: result.width,
                height: result.height
            };
        } catch (error) {
            console.error('Cloudinary get info error:', error);
            return null;
        }
    }

    /**
     * Generate embed code for the file
     * @param {String} url - Cloudinary URL
     * @param {String} type - File type (ebook/audiobook)
     * @returns {String} HTML embed code
     */
    static generateEmbedCode(url, type) {
        if (type === 'audiobook') {
            return `
                <audio controls style="width: 100%;">
                    <source src="${url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            `;
        } else if (type === 'ebook') {
            return `
                <iframe 
                    src="${url}#view=fitH" 
                    width="100%" 
                    height="600px" 
                    frameborder="0"
                    style="border: 1px solid #ddd;">
                </iframe>
            `;
        }
        return '';
    }
}

module.exports = CloudinaryService;