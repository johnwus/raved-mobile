"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const config_1 = require("../config");
const upload_service_1 = require("../services/upload.service");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage(); // Store in memory for processing
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: config_1.CONFIG.MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
        if (config_1.CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype) ||
            config_1.CONFIG.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// Upload single image
router.post('/image', auth_middleware_1.authenticate, rate_limit_middleware_1.uploadRateLimit, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        // Validate file
        upload_service_1.uploadService.validateFile(req.file, config_1.CONFIG.ALLOWED_IMAGE_TYPES);
        // Upload to cloud storage
        const result = await upload_service_1.uploadService.uploadImage(req.file);
        res.json({
            success: true,
            url: result.url,
            key: result.key,
            message: 'Image uploaded successfully'
        });
    }
    catch (error) {
        console.error('Image Upload Error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
});
// Upload multiple images
router.post('/images', auth_middleware_1.authenticate, rate_limit_middleware_1.uploadRateLimit, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No image files provided' });
        }
        const files = req.files;
        // Validate all files
        files.forEach(file => {
            upload_service_1.uploadService.validateFile(file, config_1.CONFIG.ALLOWED_IMAGE_TYPES);
        });
        // Upload all images
        const results = await upload_service_1.uploadService.uploadMultipleImages(files);
        res.json({
            success: true,
            uploads: results.map(result => ({
                url: result.url,
                key: result.key
            })),
            message: 'Images uploaded successfully'
        });
    }
    catch (error) {
        console.error('Images Upload Error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload images' });
    }
});
// Upload video
router.post('/video', auth_middleware_1.authenticate, rate_limit_middleware_1.uploadRateLimit, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }
        // Validate file
        upload_service_1.uploadService.validateFile(req.file, config_1.CONFIG.ALLOWED_VIDEO_TYPES);
        // Upload to cloud storage
        const result = await upload_service_1.uploadService.uploadVideo(req.file);
        res.json({
            success: true,
            url: result.url,
            key: result.key,
            message: 'Video uploaded successfully'
        });
    }
    catch (error) {
        console.error('Video Upload Error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload video' });
    }
});
// Upload profile avatar
router.post('/avatar', auth_middleware_1.authenticate, rate_limit_middleware_1.uploadRateLimit, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No avatar file provided' });
        }
        // Validate file
        upload_service_1.uploadService.validateFile(req.file, config_1.CONFIG.ALLOWED_IMAGE_TYPES);
        // Upload avatar with processing (resize to 300x300)
        const result = await upload_service_1.uploadService.uploadAvatar(req.file);
        res.json({
            success: true,
            url: result.url,
            key: result.key,
            message: 'Avatar uploaded and processed successfully'
        });
    }
    catch (error) {
        console.error('Avatar Upload Error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload avatar' });
    }
});
exports.default = router;
