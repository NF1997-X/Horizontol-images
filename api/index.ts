import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage.js';

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
    // Parse the URL to get the path
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Remove 'api' from the path
    if (pathParts[0] === 'api') {
      pathParts.shift();
    }

    // Handle different API routes
    if (pathParts[0] === 'pages') {
      if (req.method === 'GET' && pathParts.length === 1) {
        // GET /api/pages
        const pages = await storage.getAllPages();
        return res.json(pages);
      }
      
      if (req.method === 'POST' && pathParts.length === 1) {
        // POST /api/pages
        const { name } = req.body;
        const page = await storage.createPage({ name });
        return res.status(201).json(page);
      }
    }

    // Default response
    return res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}