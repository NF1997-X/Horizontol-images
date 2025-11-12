import 'dotenv/config';
import { db } from '../server/database';
import { pages, rows, images } from '../shared/schema';

async function seedDatabase() {
  try {
    console.log('Checking if database has data...');
    
    // Check if we already have data
    const existingPages = await db.select().from(pages);
    if (existingPages.length > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding database with initial data...');

    // Create sample pages
    const [page1, page2] = await db.insert(pages).values([
      { name: "Gallery 1", order: 0 },
      { name: "Gallery 2", order: 1 }
    ]).returning();

    console.log('Created pages:', page1.id, page2.id);

    // Create sample rows
    const [row1, row2, row3] = await db.insert(rows).values([
      { pageId: page1.id, title: "Nature Collection", order: 0 },
      { pageId: page1.id, title: "Urban Photography", order: 1 },
      { pageId: page2.id, title: "Abstract Art", order: 0 }
    ]).returning();

    console.log('Created rows:', row1.id, row2.id, row3.id);

    // Create sample images
    const sampleImages = [
      { rowId: row1.id, url: "https://picsum.photos/id/112/300/300", title: "Mountain View", subtitle: "Beautiful landscape", order: 0 },
      { rowId: row1.id, url: "https://picsum.photos/id/122/300/300", title: "Ocean Waves", subtitle: "Seascape", order: 1 },
      { rowId: row1.id, url: "https://picsum.photos/id/132/300/300", title: "Forest Path", subtitle: "Nature trail", order: 2 },
      { rowId: row1.id, url: "https://picsum.photos/id/142/300/300", title: "Desert Sunset", subtitle: "Golden hour", order: 3 },
      { rowId: row1.id, url: "https://picsum.photos/id/152/300/300", title: "River Flow", subtitle: "Waterscape", order: 4 },
      { rowId: row1.id, url: "https://picsum.photos/id/162/300/300", title: "Snow Peak", subtitle: "Winter scene", order: 5 },
      { rowId: row2.id, url: "https://picsum.photos/id/172/300/300", title: "City Lights", subtitle: "Night view", order: 0 },
      { rowId: row2.id, url: "https://picsum.photos/id/182/300/300", title: "Street Art", subtitle: "Graffiti", order: 1 },
      { rowId: row2.id, url: "https://picsum.photos/id/192/300/300", title: "Architecture", subtitle: "Modern building", order: 2 },
      { rowId: row2.id, url: "https://picsum.photos/id/1102/300/300", title: "Bridge", subtitle: "Infrastructure", order: 3 },
      { rowId: row3.id, url: "https://picsum.photos/id/103/300/300", title: "Color Splash", subtitle: "Abstract", order: 0 },
      { rowId: row3.id, url: "https://picsum.photos/id/113/300/300", title: "Geometric", subtitle: "Patterns", order: 1 },
      { rowId: row3.id, url: "https://picsum.photos/id/123/300/300", title: "Texture", subtitle: "Surface", order: 2 },
      { rowId: row3.id, url: "https://picsum.photos/id/133/300/300", title: "Gradient", subtitle: "Colors", order: 3 },
      { rowId: row3.id, url: "https://picsum.photos/id/143/300/300", title: "Shapes", subtitle: "Forms", order: 4 },
    ];

    await db.insert(images).values(sampleImages);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };