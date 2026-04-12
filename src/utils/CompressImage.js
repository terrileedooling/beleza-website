/**
 * Compress image before upload to save storage and bandwidth
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} Compressed image blob
 */

// Configuration constants
const MAX_FILE_SIZE_MB = 2; // Maximum 2MB per image
const MAX_WIDTH = 1200; // Maximum width in pixels
const MAX_HEIGHT = 1200; // Maximum height in pixels
const DEFAULT_QUALITY = 0.8; // 80% quality (good balance)
const MIN_QUALITY = 0.5; // Minimum 50% quality
const MAX_QUALITY = 0.9; // Maximum 90% quality

export const compressImage = async (file, customOptions = {}) => {
  const options = {
    maxSizeMB: customOptions.maxSizeMB || MAX_FILE_SIZE_MB,
    maxWidth: customOptions.maxWidth || MAX_WIDTH,
    maxHeight: customOptions.maxHeight || MAX_HEIGHT,
    quality: customOptions.quality || DEFAULT_QUALITY,
    ...customOptions
  };

  return new Promise((resolve, reject) => {
    // Check if file is too large before processing
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > 10) {
      reject(new Error(`File too large: ${fileSizeMB.toFixed(2)}MB. Maximum allowed is 10MB before compression.`));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > options.maxWidth) {
            height = (height * options.maxWidth) / width;
            width = options.maxWidth;
          }
        } else {
          if (height > options.maxHeight) {
            width = (width * options.maxHeight) / height;
            height = options.maxHeight;
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine output format (use JPEG for photos, keep PNG for graphics with transparency)
        let outputFormat = 'image/jpeg';
        let outputQuality = options.quality;
        
        if (file.type === 'image/png' && ctx.getImageData(0, 0, width, height).data.some(alpha => alpha < 255)) {
          // Keep PNG if it has transparency
          outputFormat = 'image/png';
          outputQuality = 1; // PNG is lossless
        }
        
        // Compress and convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'));
              return;
            }
            
            const compressedSizeMB = blob.size / 1024 / 1024;
            
            // If still too large and quality can be reduced further
            if (compressedSizeMB > options.maxSizeMB && outputQuality > MIN_QUALITY) {
              // Try again with lower quality
              const newQuality = Math.max(MIN_QUALITY, outputQuality - 0.2);
              canvas.toBlob(
                (retryBlob) => {
                  if (retryBlob && retryBlob.size / 1024 / 1024 <= options.maxSizeMB) {
                    resolve(retryBlob);
                  } else {
                    // Return the best we have with a warning
                    console.warn(`Image compressed to ${compressedSizeMB.toFixed(2)}MB, still above ${options.maxSizeMB}MB limit`);
                    resolve(blob);
                  }
                },
                outputFormat,
                newQuality
              );
            } else {
              resolve(blob);
            }
          },
          outputFormat,
          outputQuality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

// Helper function to validate image before upload
export const validateImage = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeMB = 5; // Maximum 5MB before compression
  
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${allowedTypes.map(t => t.replace('image/', '')).join(', ')}` 
    };
  }
  
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB > maxSizeMB) {
    return { 
      valid: false, 
      error: `File too large: ${fileSizeMB.toFixed(2)}MB. Maximum size is ${maxSizeMB}MB before compression.` 
    };
  }
  
  return { valid: true, error: null };
};

// Get image dimensions helper
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};