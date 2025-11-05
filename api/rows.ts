import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for demo purposes
let rows: any[] = [];

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
    if (req.method === 'POST') {
      // Create new row
      const { pageId, title } = req.body;
      const newRow = {
        id: Date.now().toString(),
        pageId: pageId || '1',
        title: title || 'New Row',
        order: rows.filter(r => r.pageId === pageId).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      rows.push(newRow);
      return res.status(201).json(newRow);
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Rows API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}