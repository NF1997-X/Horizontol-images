import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for demo purposes
let pages = [
  { id: '1', name: 'Default Page', order: 0, createdAt: '2025-11-05T10:00:00.000Z', updatedAt: '2025-11-05T10:00:00.000Z' }
];

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
    if (req.method === 'GET') {
      // Return all pages
      return res.json(pages);
    }
    
    if (req.method === 'POST') {
      // Create new page
      const { name } = req.body;
      const newPage = {
        id: Date.now().toString(),
        name: name || 'New Page',
        order: pages.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      pages.push(newPage);
      return res.status(201).json(newPage);
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Pages API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}