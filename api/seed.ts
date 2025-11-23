import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../server/database.js';
import { pages, rows, images } from '../shared/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🌱 Starting database seed...');
    
    // Check existing data
    const existingPages = await db.select().from(pages);
    
    if (existingPages.length > 0) {
      const allRows = await db.select().from(rows);
      const allImages = await db.select().from(images);
      
      return res.status(200).json({
        message: 'Database already has data',
        data: {
          pages: existingPages.length,
          rows: allRows.length,
          images: allImages.length
        }
      });
    }

    console.log('📝 Creating initial data...');

    // Create page
    const [page1] = await db.insert(pages).values([
      { name: "My Gallery", order: 0 }
    ]).returning();

    console.log('✅ Created page:', page1.id);

    // Create rows
    const [row1, row2] = await db.insert(rows).values([
      { pageId: page1.id, title: "Photo Collection", order: 0 },
      { pageId: page1.id, title: "More Photos", order: 1 }
    ]).returning();

    console.log('✅ Created rows:', row1.id, row2.id);

    // Create sample images
    await db.insert(images).values([
      { rowId: row1.id, url: "https://picsum.photos/800/600?random=1", title: "Sample Image 1", subtitle: "Description", order: 0 },
      { rowId: row1.id, url: "https://picsum.photos/800/600?random=2", title: "Sample Image 2", subtitle: "Description", order: 1 },
      { rowId: row2.id, url: "https://picsum.photos/800/600?random=3", title: "Sample Image 3", subtitle: "Description", order: 0 }
    ]);

    console.log('✅ Created sample images');

    return res.status(201).json({
      message: 'Database seeded successfully!',
      data: {
        page: { id: page1.id, name: page1.name },
        rows: [
          { id: row1.id, title: row1.title },
          { id: row2.id, title: row2.title }
        ],
        images: 3
      }
    });
  } catch (error: any) {
    console.error('❌ Seed error:', error);
    return res.status(500).json({ 
      error: 'Failed to seed database',
      details: error.message 
    });
  }
}
