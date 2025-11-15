import type { VercelRequest, VercelResponse } from '@vercel/node';
import Busboy from 'busboy';
import { uploadToCloudinary } from '../server/cloudinary.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bb = Busboy({ headers: req.headers as any });

    let filePromise: Promise<{ filename: string; buffer: Buffer; mimetype: string } | null> = new Promise((resolve, reject) => {
      let fileBuffer: Buffer[] = [];
      let filename = '';
      let mimetype = '';

      bb.on('file', (_name, file, info) => {
        filename = info.filename || `upload-${Date.now()}`;
        mimetype = info.mimeType || 'application/octet-stream';
        file.on('data', (data: Buffer) => fileBuffer.push(data));
        file.on('limit', () => reject(new Error('File too large')));
        file.on('end', () => {
          const buffer = Buffer.concat(fileBuffer);
          resolve({ filename, buffer, mimetype });
        });
      });

      bb.on('error', (err) => reject(err));
      bb.on('finish', () => {
        if (fileBuffer.length === 0) resolve(null);
      });
    });

    req.pipe(bb);

    const file = await filePromise;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image uploads are allowed' });
    }

    console.log('📁 Uploading to Cloudinary:', file.filename, `(${Math.round(file.buffer.length / 1024)}KB)`);

    // Upload to Cloudinary instead of local filesystem
    const cloudinaryUrl = await uploadToCloudinary(file.buffer, file.filename);
    
    console.log('✅ Cloudinary upload successful:', cloudinaryUrl);
    
    return res.status(201).json({ 
      url: cloudinaryUrl, 
      pathname: cloudinaryUrl,
      message: 'Image uploaded to cloud storage successfully' 
    });
  } catch (error: any) {
    console.error('❌ Upload API error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload image to cloud storage', 
      details: String(error?.message || error) 
    });
  }
}
