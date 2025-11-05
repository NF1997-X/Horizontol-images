import type { VercelRequest, VercelResponse } from '@vercel/node';

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
      // Return mock row data
      return res.json({
        id: rowId,
        pageId: '1',
        title: 'Sample Row',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    if (req.method === 'PATCH') {
      // Update row
      const { title } = req.body;
      return res.json({
        id: rowId,
        pageId: '1',
        title: title || 'Updated Row',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    if (req.method === 'DELETE') {
      // Delete row
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Individual Row API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}