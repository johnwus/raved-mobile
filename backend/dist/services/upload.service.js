"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const cloudinary_1 = require("cloudinary");
const config_1 = require("../config");
const path_1 = __importDefault(require("path"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class UploadService {
    // Cloudinary upload helper
    async uploadToCloudinary(file, folder, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                resource_type: 'auto',
                ...options
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(file);
        });
    }
    // Mock S3 client for development - replace with actual AWS SDK when available
    mockS3Upload(file, key) {
        // In production, this would upload to S3
        console.log(`Mock upload: ${key} (${file.length} bytes)`);
        return Promise.resolve();
    }
    // Upload image with optional resizing
    async uploadImage(file, folder = 'images', options = {}) {
        try {
            const { resize, quality = 80 } = options;
            let buffer = file.buffer;
            // Process image if resizing is requested
            if (resize) {
                buffer = await (0, sharp_1.default)(buffer)
                    .resize(resize.width, resize.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                    .jpeg({ quality })
                    .toBuffer();
            }
            // Upload to Cloudinary (primary) or fallback to mock
            let result;
            try {
                result = await this.uploadToCloudinary(buffer, folder, {
                    public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    format: 'jpg',
                    quality: 'auto'
                });
            }
            catch (cloudinaryError) {
                console.warn('Cloudinary upload failed, using mock:', cloudinaryError);
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path_1.default.extname(file.originalname)}`;
                const key = `${folder}/${fileName}`;
                await this.mockS3Upload(buffer, key);
                return {
                    url: `https://api.raved.app/uploads/${key}`,
                    key,
                    bucket: 'raved-uploads'
                };
            }
            return {
                url: result.secure_url,
                key: result.public_id,
                bucket: result.cloud_name || 'cloudinary'
            };
        }
        catch (error) {
            console.error('Image upload error:', error);
            throw new Error('Failed to upload image');
        }
    }
    // Upload video
    async uploadVideo(file, folder = 'videos') {
        try {
            // Upload to Cloudinary (primary) or fallback to mock
            let result;
            try {
                result = await this.uploadToCloudinary(file.buffer, folder, {
                    public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    resource_type: 'video'
                });
            }
            catch (cloudinaryError) {
                console.warn('Cloudinary upload failed, using mock:', cloudinaryError);
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path_1.default.extname(file.originalname)}`;
                const key = `${folder}/${fileName}`;
                await this.mockS3Upload(file.buffer, key);
                return {
                    url: `https://api.raved.app/uploads/${key}`,
                    key,
                    bucket: 'raved-uploads'
                };
            }
            return {
                url: result.secure_url,
                key: result.public_id,
                bucket: result.cloud_name || 'cloudinary'
            };
        }
        catch (error) {
            console.error('Video upload error:', error);
            throw new Error('Failed to upload video');
        }
    }
    // Upload avatar with specific processing
    async uploadAvatar(file) {
        return this.uploadImage(file, 'avatars', {
            resize: { width: 300, height: 300 },
            quality: 85
        });
    }
    // Delete file from storage
    async deleteFile(key) {
        try {
            // Mock deletion for development
            console.log(`Mock delete: ${key}`);
        }
        catch (error) {
            console.error('File deletion error:', error);
            throw new Error('Failed to delete file');
        }
    }
    // Generate signed URL for private files (if needed)
    async getSignedUrl(key, expiresIn = 3600) {
        try {
            // Mock signed URL for development
            return `https://api.raved.app/uploads/signed/${key}?expires=${Date.now() + expiresIn * 1000}`;
        }
        catch (error) {
            console.error('Signed URL generation error:', error);
            throw new Error('Failed to generate signed URL');
        }
    }
    // Validate file type and size
    validateFile(file, allowedTypes, maxSize = config_1.CONFIG.MAX_FILE_SIZE) {
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }
        if (file.size > maxSize) {
            throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
        }
    }
    // Process multiple images
    async uploadMultipleImages(files, folder = 'images') {
        const results = [];
        for (const file of files) {
            const result = await this.uploadImage(file, folder);
            results.push(result);
        }
        return results;
    }
}
exports.uploadService = new UploadService();
