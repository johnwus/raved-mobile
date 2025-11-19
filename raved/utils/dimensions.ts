import { Image } from 'react-native';

export interface MediaDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Get dimensions for media content, maintaining original aspect ratio
 * @param uri - Media URI
 * @param fallbackAspectRatio - Fallback aspect ratio if dimensions can't be determined
 * @returns Promise resolving to media dimensions
 */
export const getMediaDimensions = (uri: string, fallbackAspectRatio: number = 1): Promise<MediaDimensions> => {
  return new Promise((resolve) => {
    if (!uri) {
      resolve({
        width: 300,
        height: 300,
        aspectRatio: fallbackAspectRatio
      });
      return;
    }

    // For remote images, try to get dimensions
    Image.getSize(
      uri,
      (width, height) => {
        const aspectRatio = width / height;
        resolve({
          width,
          height,
          aspectRatio
        });
      },
      (error) => {
        console.warn('Failed to get image dimensions:', error);
        // Fallback to square dimensions
        resolve({
          width: 300,
          height: 300 / fallbackAspectRatio,
          aspectRatio: fallbackAspectRatio
        });
      }
    );
  });
};

/**
 * Calculate optimal container dimensions for media display
 * @param originalDimensions - Original media dimensions
 * @param maxWidth - Maximum allowed width
 * @param maxHeight - Maximum allowed height (optional)
 * @returns Optimized dimensions for display
 */
export const calculateOptimalDimensions = (
  originalDimensions: MediaDimensions,
  maxWidth: number,
  maxHeight?: number
): MediaDimensions => {
  const { width: _originalWidth, height: _originalHeight, aspectRatio } = originalDimensions;

  // If we have a max height constraint, calculate based on that
  if (maxHeight) {
    const heightBasedWidth = maxHeight * aspectRatio;
    const widthBasedHeight = maxWidth / aspectRatio;

    if (heightBasedWidth <= maxWidth) {
      // Height is the limiting factor
      return {
        width: heightBasedWidth,
        height: maxHeight,
        aspectRatio
      };
    } else {
      // Width is the limiting factor
      return {
        width: maxWidth,
        height: widthBasedHeight,
        aspectRatio
      };
    }
  }

  // Only max width constraint
  const calculatedHeight = maxWidth / aspectRatio;

  return {
    width: maxWidth,
    height: calculatedHeight,
    aspectRatio
  };
};

/**
 * Get container style for media based on dimensions
 * @param dimensions - Media dimensions
 * @param maxWidth - Maximum container width
 * @returns Style object for media container
 */
export const getMediaContainerStyle = (dimensions: MediaDimensions, maxWidth: number) => {
  const optimal = calculateOptimalDimensions(dimensions, maxWidth);

  return {
    width: optimal.width,
    height: optimal.height,
    aspectRatio: optimal.aspectRatio,
  };
};

/**
 * Hook for managing media dimensions in React components
 */
export const useMediaDimensions = () => {
  const getDimensions = async (uri: string, fallbackAspectRatio: number = 1) => {
    return await getMediaDimensions(uri, fallbackAspectRatio);
  };

  const getContainerStyle = (dimensions: MediaDimensions, maxWidth: number) => {
    return getMediaContainerStyle(dimensions, maxWidth);
  };

  return {
    getDimensions,
    getContainerStyle,
    calculateOptimalDimensions
  };
};