import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  width: number;
  height: number;
}

export async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'gallery-images',
        public_id: `image_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result: CloudinaryUploadResult | undefined) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Failed to upload to Cloudinary: ${error.message}`));
        } else if (result) {
          console.log('✅ Cloudinary upload successful:', result.secure_url);
          resolve(result.secure_url);
        } else {
          reject(new Error('No result from Cloudinary upload'));
        }
      }
    );

    // Create a readable stream from buffer
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    
    // Pipe the stream to Cloudinary
    readableStream.pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
  try {
    // Extract public_id from Cloudinary URL
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.warn('Could not extract public_id from URL:', imageUrl);
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.extension
    const match = url.match(/\/gallery-images\/([^\.]+)/);
    return match ? `gallery-images/${match[1]}` : null;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

export default cloudinary;