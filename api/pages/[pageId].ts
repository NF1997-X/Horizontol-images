import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { updatePageSchema } from '../../shared/schema';
import { z } from 'zod';

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
    const { pageId } = req.query;
    
    if (req.method === 'GET') {
      // Get page from database
      const page = await storage.getPage(pageId as string);
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      return res.json(page);
    }
    
    if (req.method === 'PATCH') {
      // Update page in database
      const data = updatePageSchema.parse(req.body);
      const page = await storage.updatePage(pageId as string, data);
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }
      return res.json(page);
    }
    
    if (req.method === 'DELETE') {
      // Delete page from database
      await storage.deletePage(pageId as string);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Individual Page API Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}