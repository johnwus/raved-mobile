import { Dimensions, Image } from 'react-native';

const CACHE = new Map<string, { width: number; height: number }>();
const MAX_HEIGHT = Dimensions.get('window').height * 0.66; // Max 66% of screen height
const MIN_HEIGHT = 200;

export const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    // Return cached dimensions if available
    if (CACHE.has(uri)) {
      resolve(CACHE.get(uri)!);
      return;
    }

    Image.getSize(
      uri,
      (width, height) => {
        const screenWidth = Dimensions.get('window').width;
        const constrainedWidth = screenWidth - 8; // Account for card margins
        
        // Calculate aspect ratio and constrain height
        const aspectRatio = width / height;
        let constrainedHeight = constrainedWidth / aspectRatio;

        // Apply reasonable max/min height constraints
        if (constrainedHeight > MAX_HEIGHT) {
          constrainedHeight = MAX_HEIGHT;
        } else if (constrainedHeight < MIN_HEIGHT) {
          constrainedHeight = MIN_HEIGHT;
        }

        const dimensions = { 
          width: constrainedWidth, 
          height: constrainedHeight 
        };
        
        CACHE.set(uri, dimensions);
        resolve(dimensions);
      },
      () => {
        // Fallback to square if unable to get dimensions
        const fallback = { width: Dimensions.get('window').width - 8, height: 300 };
        CACHE.set(uri, fallback);
        resolve(fallback);
      }
    );
  });
};

export const clearDimensionsCache = () => {
  CACHE.clear();
};
