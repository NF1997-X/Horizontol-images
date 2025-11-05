import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import Busboy from 'busboy';

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

    // Upload to Vercel Blob (requires BLOB_READ_WRITE_TOKEN env in Vercel project)
    const blob = await put(`images/${Date.now()}-${file.filename}`.replace(/\s+/g, '-'), file.buffer, {
      access: 'public',
      contentType: file.mimetype,
    });

    return res.status(201).json({ url: blob.url, pathname: blob.pathname });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return res.status(500).json({ error: 'Failed to upload image', details: String(error?.message || error) });
  }
}
