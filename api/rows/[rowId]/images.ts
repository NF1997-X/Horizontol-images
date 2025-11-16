import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { rowId } = req.query;
    
    if (req.method === 'GET') {
      // Get images for this row from database
      const images = await storage.getImagesByRow(rowId as string);
      return res.json(images);
    }

    if (req.method === 'POST') {
      // Create new image for this row
      const { url, title, subtitle } = req.body;
      
      if (!url || !title) {
        return res.status(400).json({ error: 'URL and title are required' });
      }
      
      const image = await storage.createImage({
        rowId: rowId as string,
        url,
        title,
        subtitle: subtitle || null
      });
      
      return res.status(201).json(image);
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Row Images API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}