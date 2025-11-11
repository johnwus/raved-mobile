import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware';
import { CONFIG } from '../config';
import { uploadService } from '../services/upload.service';
import { uploadRateLimit } from '../middleware/rate-limit.middleware';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store in memory for processing

const upload = multer({
  storage,
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype) ||
        CONFIG.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload single image
router.post('/image', authenticate, uploadRateLimit, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file
    uploadService.validateFile(req.file, CONFIG.ALLOWED_IMAGE_TYPES);

    // Upload to cloud storage
    const result = await uploadService.uploadImage(req.file);

    res.json({
      success: true,
      url: result.url,
      key: result.key,
      message: 'Image uploaded successfully'
    });
  } catch (error: any) {
    console.error('Image Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

// Upload multiple images
router.post('/images', authenticate, uploadRateLimit, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const files = req.files as Express.Multer.File[];

    // Validate all files
    files.forEach(file => {
      uploadService.validateFile(file, CONFIG.ALLOWED_IMAGE_TYPES);
    });

    // Upload all images
    const results = await uploadService.uploadMultipleImages(files);

    res.json({
      success: true,
      uploads: results.map(result => ({
        url: result.url,
        key: result.key
      })),
      message: 'Images uploaded successfully'
    });
  } catch (error: any) {
    console.error('Images Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload images' });
  }
});

// Upload video
router.post('/video', authenticate, uploadRateLimit, upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Validate file
    uploadService.validateFile(req.file, CONFIG.ALLOWED_VIDEO_TYPES);

    // Upload to cloud storage
    const result = await uploadService.uploadVideo(req.file);

    res.json({
      success: true,
      url: result.url,
      key: result.key,
      message: 'Video uploaded successfully'
    });
  } catch (error: any) {
    console.error('Video Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload video' });
  }
});

// Upload profile avatar
router.post('/avatar', authenticate, uploadRateLimit, upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No avatar file provided' });
    }

    // Validate file
    uploadService.validateFile(req.file, CONFIG.ALLOWED_IMAGE_TYPES);

    // Upload avatar with processing (resize to 300x300)
    const result = await uploadService.uploadAvatar(req.file);

    res.json({
      success: true,
      url: result.url,
      key: result.key,
      message: 'Avatar uploaded and processed successfully'
    });
  } catch (error: any) {
    console.error('Avatar Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload avatar' });
  }
});

export default router;