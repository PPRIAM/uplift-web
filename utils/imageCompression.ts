/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Returns the compressed image as a Blob (or the original File if compression fails or isn't applicable).
 * 
 * @param file The input File object.
 * @param maxDimension The maximum width or height of the output image.
 * @param quality The JPEG compression quality (0.0 to 1.0).
 */
export function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
  maxSizeInBytes = 1024 * 1024 // 1 MB par défaut
): Promise<Blob | File> {
  return new Promise((resolve) => {
    // Skip compression for non-images
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        const exceedsSize = file.size > maxSizeInBytes;
        const exceedsDimensions = width > maxDimension || height > maxDimension;

        // Si l'image respecte déjà les limites de taille et de dimensions, on ne la compresse pas
        if (!exceedsSize && !exceedsDimensions) {
          resolve(file);
          return;
        }

        const canvas = document.createElement('canvas');
        let newWidth = width;
        let newHeight = height;

        // Resize logic to maintain aspect ratio
        if (newWidth > newHeight) {
          if (newWidth > maxDimension) {
            newHeight = Math.round((newHeight * maxDimension) / newWidth);
            newWidth = maxDimension;
          }
        } else {
          if (newHeight > maxDimension) {
            newWidth = Math.round((newWidth * maxDimension) / newHeight);
            newHeight = maxDimension;
          }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // Fallback to original file
          return;
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // Fallback to original file
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file); // Fallback
    };
    reader.onerror = () => resolve(file); // Fallback
  });
}
