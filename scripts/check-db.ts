import { neon } from '@neondatabase/serverless';

const PROD_URL = 'postgresql://neondb_owner:npg_V9HXAN5dQJBw@ep-misty-haze-ahu4jh8e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function checkDatabase() {
  console.log('🔍 Checking production database...\n');
  
  try {
    const sql = neon(PROD_URL, { 
      fetchOptions: {
        cache: 'no-store',
      }
    });
    
    // Check pages
    const pages = await sql`SELECT * FROM pages`;
    console.log(`📄 Pages (${pages.length}):`);
    pages.forEach(p => console.log(`   - ${p.name} (${p.id})`));
    
    // Check rows
    const rows = await sql`SELECT * FROM rows`;
    console.log(`\n📋 Rows (${rows.length}):`);
    rows.forEach(r => console.log(`   - ${r.title} (page: ${r.page_id})`));
    
    // Check images
    const images = await sql`SELECT * FROM images`;
    console.log(`\n🖼️  Images (${images.length}):`);
    images.forEach(img => console.log(`   - ${img.title} (row: ${img.row_id})`));
    
    console.log('\n✅ Database check complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();
