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
    const { pageId } = req.query;
    
    if (req.method === 'GET') {
      // Return mock page data
      return res.json({
        id: pageId,
        name: 'Default Page',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    if (req.method === 'PATCH') {
      // Update page
      const { name } = req.body;
      return res.json({
        id: pageId,
        name: name || 'Updated Page',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    if (req.method === 'DELETE') {
      // Delete page
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Individual Page API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}