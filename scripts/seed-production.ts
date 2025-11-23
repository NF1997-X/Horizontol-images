import 'dotenv/config';

// This script seeds the production database directly via the production DATABASE_URL
async function seedProduction() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
  }

  console.log('🌱 Seeding PRODUCTION database...');
  console.log('📍 Database:', DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown');

  try {
    // Import after env is loaded
    const { db } = await import('../server/database.js');
    const { pages, rows, images } = await import('../shared/schema.js');

    // Check existing data
    const existingPages = await db.select().from(pages);
    
    if (existingPages.length > 0) {
      console.log('⚠️  Database already has data:');
      console.log(`   - ${existingPages.length} pages`);
      
      const allRows = await db.select().from(rows);
      console.log(`   - ${allRows.length} rows`);
      
      const allImages = await db.select().from(images);
      console.log(`   - ${allImages.length} images`);
      
      console.log('\n✅ Production database is already seeded!');
      process.exit(0);
    }

    console.log('📝 Creating initial data...');

    // Create pages
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
    console.log('\n🎉 Production database seeded successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - 1 page (${page1.id})`);
    console.log(`   - 2 rows (${row1.id}, ${row2.id})`);
    console.log(`   - 3 images`);
    console.log('\n✨ You can now use the app at your Vercel URL!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding production:', error);
    process.exit(1);
  }
}

seedProduction();
