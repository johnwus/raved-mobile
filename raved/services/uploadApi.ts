import api from './api';

export interface UploadResponse {
  success: boolean;
  url: string;
  key: string;
  message: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  uploads: Array<{
    url: string;
    key: string;
  }>;
  message: string;
}

export const uploadApi = {
  // Image uploads
  uploadImage: async (imageFile: File | Blob) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as UploadResponse;
  },

  uploadMultipleImages: async (imageFiles: Array<File | Blob>) => {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });

    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as MultipleUploadResponse;
  },

  // Video uploads
  uploadVideo: async (videoFile: File | Blob) => {
    const formData = new FormData();
    formData.append('video', videoFile);

    const response = await api.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as UploadResponse;
  },

  // Avatar uploads
  uploadAvatar: async (avatarFile: File | Blob) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as UploadResponse;
  },

  // Story uploads (if needed)
  uploadStory: async (storyFile: File | Blob, type: 'image' | 'video' = 'image') => {
    const formData = new FormData();
    formData.append(type, storyFile);

    const response = await api.post(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as UploadResponse;
  },

  // Delete uploaded files
  deleteUpload: async (key: string) => {
    const response = await api.delete('/upload', { data: { key } });
    return response.data;
  },

  // Get upload URL for direct uploads (if supported)
  getUploadUrl: async (fileName: string, fileType: string) => {
    const response = await api.post('/upload/url', { fileName, fileType });
    return response.data;
  },
};

export default uploadApi;