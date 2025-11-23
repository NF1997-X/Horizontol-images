import type { VercelRequest, VercelResponse } from '@vercel/node';

// Ultra simple in-memory storage untuk testing
let pages: any[] = [
  { id: '1', name: 'My Gallery', createdAt: new Date().toISOString(), order: 0 }
];

let rows: any[] = [
  { id: '1', pageId: '1', title: 'Sample Row', order: 0, createdAt: new Date().toISOString() }
];

let images: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  
  try {
    // Pages endpoints
    if (req.url === '/api/pages' && method === 'GET') {
      return res.json(pages);
    }
    
    if (req.url?.startsWith('/api/pages/') && method === 'GET') {
      const pageId = req.url.split('/')[3];
      const page = pages.find(p => p.id === pageId);
      return res.json(page || null);
    }
    
    // Rows endpoints  
    if (req.url?.includes('/rows') && method === 'GET') {
      const pageId = req.url.split('/')[3];
      const pageRows = rows.filter(r => r.pageId === pageId);
      return res.json(pageRows);
    }
    
    // Images endpoints
    if (req.url?.includes('/images') && method === 'GET') {
      const rowId = req.url.split('/')[3];
      const rowImages = images.filter(i => i.rowId === rowId);
      return res.json(rowImages);
    }
    
    // Create image
    if (req.url?.includes('/images') && method === 'POST') {
      const rowId = req.url.split('/')[3];
      const { url, title, subtitle } = req.body;
      
      const newImage = {
        id: Date.now().toString(),
        rowId,
        url,
        title: title || 'Untitled',
        subtitle: subtitle || null,
        createdAt: new Date().toISOString(),
        order: images.filter(i => i.rowId === rowId).length
      };
      
      images.push(newImage);
      return res.status(201).json(newImage);
    }
    
    return res.status(404).json({ error: 'Endpoint not found' });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: String(error?.message || error)
    });
  }
}