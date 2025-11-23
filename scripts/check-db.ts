import 'dotenv/config';
import { db } from '../server/database';
import { pages, rows, images } from '../shared/schema';

async function checkDatabase() {
  try {
    console.log('=== Checking Database Content ===\n');
    
    // Check pages
    const allPages = await db.select().from(pages);
    console.log('📄 Pages:', allPages.length);
    allPages.forEach(p => console.log(`  - ${p.id}: ${p.name}`));
    
    // Check rows
    const allRows = await db.select().from(rows);
    console.log('\n📋 Rows:', allRows.length);
    allRows.forEach(r => console.log(`  - ${r.id}: ${r.title} (page: ${r.pageId})`));
    
    // Check images
    const allImages = await db.select().from(images);
    console.log('\n🖼️  Images:', allImages.length);
    allImages.forEach(img => console.log(`  - ${img.id}: ${img.title} (row: ${img.rowId})`));
    
    console.log('\n=== Database Check Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
