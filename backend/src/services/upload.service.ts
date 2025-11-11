import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { CONFIG } from '../config';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

class UploadService {
  // Cloudinary upload helper
  private async uploadToCloudinary(file: Buffer, folder: string, options: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          ...options
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file);
    });
  }

  // Mock S3 client for development - replace with actual AWS SDK when available
  private mockS3Upload(file: Buffer, key: string): Promise<void> {
    // In production, this would upload to S3
    console.log(`Mock upload: ${key} (${file.length} bytes)`);
    return Promise.resolve();
  }

  // Upload image with optional resizing
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'images',
    options: {
      resize?: { width?: number; height?: number };
      quality?: number;
    } = {}
  ): Promise<UploadResult> {
    try {
      const { resize, quality = 80 } = options;
      let buffer = file.buffer;

      // Process image if resizing is requested
      if (resize) {
        buffer = await sharp(buffer)
          .resize(resize.width, resize.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality })
          .toBuffer();
      }

      // Upload to Cloudinary (primary) or fallback to mock
      let result: any;
      try {
        result = await this.uploadToCloudinary(buffer, folder, {
          public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          format: 'jpg',
          quality: 'auto'
        });
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, using mock:', cloudinaryError);
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
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
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Upload video
  async uploadVideo(file: Express.Multer.File, folder: string = 'videos'): Promise<UploadResult> {
    try {
      // Upload to Cloudinary (primary) or fallback to mock
      let result: any;
      try {
        result = await this.uploadToCloudinary(file.buffer, folder, {
          public_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          resource_type: 'video'
        });
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, using mock:', cloudinaryError);
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
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
    } catch (error) {
      console.error('Video upload error:', error);
      throw new Error('Failed to upload video');
    }
  }

  // Upload avatar with specific processing
  async uploadAvatar(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, 'avatars', {
      resize: { width: 300, height: 300 },
      quality: 85
    });
  }

  // Delete file from storage
  async deleteFile(key: string): Promise<void> {
    try {
      // Mock deletion for development
      console.log(`Mock delete: ${key}`);
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Generate signed URL for private files (if needed)
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Mock signed URL for development
      return `https://api.raved.app/uploads/signed/${key}?expires=${Date.now() + expiresIn * 1000}`;
    } catch (error) {
      console.error('Signed URL generation error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  // Validate file type and size
  validateFile(file: Express.Multer.File, allowedTypes: string[], maxSize: number = CONFIG.MAX_FILE_SIZE): void {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }
  }

  // Process multiple images
  async uploadMultipleImages(files: Express.Multer.File[], folder: string = 'images'): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadImage(file, folder);
      results.push(result);
    }

    return results;
  }
}

export const uploadService = new UploadService();