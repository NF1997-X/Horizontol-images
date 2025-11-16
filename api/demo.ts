import type { VercelRequest, VercelResponse } from '@vercel/node';

// TypeScript interface for share links
interface ShareLink {
  id: string;
  pageId: string;
  shortCode: string;
  createdAt: string;
}

// Demo data - no database needed!
const DEMO_DATA = {
  pages: [
    { id: '1', name: 'My Demo Gallery', createdAt: new Date().toISOString(), order: 0 }
  ],
  rows: [
    { id: '1', pageId: '1', title: 'Nature Photos', order: 0, createdAt: new Date().toISOString() },
    { id: '2', pageId: '1', title: 'City Life', order: 1, createdAt: new Date().toISOString() },
    { id: '3', pageId: '1', title: 'Food & Drinks', order: 2, createdAt: new Date().toISOString() }
  ],
  images: [
    // Nature Photos
    { id: '1', rowId: '1', url: 'https://picsum.photos/400/300?random=1', title: 'Mountain View', subtitle: 'Beautiful landscape', order: 0, createdAt: new Date().toISOString() },
    { id: '2', rowId: '1', url: 'https://picsum.photos/400/300?random=2', title: 'Forest Path', subtitle: 'Peaceful walk', order: 1, createdAt: new Date().toISOString() },
    { id: '3', rowId: '1', url: 'https://picsum.photos/400/300?random=3', title: 'Ocean Waves', subtitle: 'Relaxing sounds', order: 2, createdAt: new Date().toISOString() },
    { id: '4', rowId: '1', url: 'https://picsum.photos/400/300?random=4', title: 'Sunset Sky', subtitle: 'Golden hour', order: 3, createdAt: new Date().toISOString() },
    
    // City Life  
    { id: '5', rowId: '2', url: 'https://picsum.photos/400/300?random=5', title: 'City Skyline', subtitle: 'Urban beauty', order: 0, createdAt: new Date().toISOString() },
    { id: '6', rowId: '2', url: 'https://picsum.photos/400/300?random=6', title: 'Street Art', subtitle: 'Creative walls', order: 1, createdAt: new Date().toISOString() },
    { id: '7', rowId: '2', url: 'https://picsum.photos/400/300?random=7', title: 'Night Lights', subtitle: 'City never sleeps', order: 2, createdAt: new Date().toISOString() },
    
    // Food & Drinks
    { id: '8', rowId: '3', url: 'https://picsum.photos/400/300?random=8', title: 'Coffee Break', subtitle: 'Morning fuel', order: 0, createdAt: new Date().toISOString() },
    { id: '9', rowId: '3', url: 'https://picsum.photos/400/300?random=9', title: 'Fresh Salad', subtitle: 'Healthy choice', order: 1, createdAt: new Date().toISOString() },
    { id: '10', rowId: '3', url: 'https://picsum.photos/400/300?random=10', title: 'Pizza Time', subtitle: 'Comfort food', order: 2, createdAt: new Date().toISOString() },
  ],
  shareLinks: [] as ShareLink[]
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

  const url = new URL(req.url!, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method;

  try {
    console.log(`[DEMO API] ${method} ${pathname}`);

    // Pages endpoints
    if (pathname === '/api/pages' && method === 'GET') {
      return res.json(DEMO_DATA.pages);
    }

    if (pathname.match(/^\/api\/pages\/\w+$/) && method === 'GET') {
      const pageId = pathname.split('/')[3];
      const page = DEMO_DATA.pages.find(p => p.id === pageId);
      return res.json(page || null);
    }

    if (pathname.match(/^\/api\/pages\/\w+\/rows$/) && method === 'GET') {
      const pageId = pathname.split('/')[3];
      const pageRows = DEMO_DATA.rows.filter(r => r.pageId === pageId);
      return res.json(pageRows);
    }

    // Rows endpoints
    if (pathname.match(/^\/api\/rows\/\w+$/) && method === 'GET') {
      const rowId = pathname.split('/')[3];
      const row = DEMO_DATA.rows.find(r => r.id === rowId);
      return res.json(row || null);
    }

    if (pathname.match(/^\/api\/rows\/\w+\/images$/) && method === 'GET') {
      const rowId = pathname.split('/')[3];
      const rowImages = DEMO_DATA.images.filter(i => i.rowId === rowId);
      return res.json(rowImages);
    }

    // Share links - simple implementation
    if (pathname.match(/^\/api\/share-links\/\w+$/) && method === 'POST') {
      const pageId = pathname.split('/')[3];
      const shortCode = Math.random().toString(36).substring(7);
      const shareLink = {
        id: Date.now().toString(),
        pageId,
        shortCode,
        createdAt: new Date().toISOString()
      };
      DEMO_DATA.shareLinks.push(shareLink);
      return res.status(201).json(shareLink);
    }

    if (pathname.match(/^\/api\/share-links\/\w+$/) && method === 'GET') {
      const shortCode = pathname.split('/')[3];
      const shareLink = DEMO_DATA.shareLinks.find(s => s.shortCode === shortCode);
      if (!shareLink) {
        // Create demo share link for testing
        const demoShareLink = {
          id: '1',
          pageId: '1',
          shortCode: shortCode,
          createdAt: new Date().toISOString()
        };
        return res.json(demoShareLink);
      }
      return res.json(shareLink);
    }

    // Fallback - return demo status
    if (pathname === '/api/status') {
      return res.json({ 
        status: 'Demo mode active', 
        message: 'Gallery running with static demo data',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(404).json({ error: 'Endpoint not found', path: pathname });

  } catch (error: any) {
    console.error('[DEMO API] Error:', error);
    return res.status(500).json({ 
      error: 'Demo API error',
      details: String(error?.message || error),
      path: pathname
    });
  }
}