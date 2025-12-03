import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema.js';
import { randomUUID } from 'crypto';

// Production database
const PROD_URL = 'postgresql://neondb_owner:npg_V9HXAN5dQJBw@ep-misty-haze-ahu4jh8e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const prodSql = neon(PROD_URL);
const prodDb = drizzle(prodSql, { schema });

async function seedProduction() {
  console.log('🌱 Seeding production database with sample data...');

  try {
    // Check existing data
    const existingPages = await prodDb.select().from(schema.pages);
    console.log(`Found ${existingPages.length} existing pages`);

    let page;
    if (existingPages.length > 0) {
      page = existingPages[0];
      console.log(`✅ Using existing page: ${page.name}`);
    } else {
      // Create a sample page
      console.log('📄 Creating sample page...');
      [page] = await prodDb.insert(schema.pages).values({
        name: 'Sample Gallery',
        order: 0
      }).returning();
      console.log(`✅ Created page: ${page.name}`);
    }

    // Check existing rows
    const existingRows = await prodDb.select().from(schema.rows);
    console.log(`Found ${existingRows.length} existing rows`);

    let row;
    if (existingRows.length > 0) {
      row = existingRows[0];
      console.log(`✅ Using existing row: ${row.title}`);
    } else {
      // Create a sample row
      console.log('📋 Creating sample row...');
      [row] = await prodDb.insert(schema.rows).values({
        pageId: page.id,
        title: 'Nature Collection',
        order: 0
      }).returning();
      console.log(`✅ Created row: ${row.title}`);
    }

    // Check existing images
    const existingImages = await prodDb.select().from(schema.images);
    console.log(`Found ${existingImages.length} existing images`);

    if (existingImages.length === 0) {
      // Create sample images
      console.log('🖼️  Creating sample images...');
      const sampleImages = [
        {
          rowId: row.id,
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          title: 'Mountain Landscape',
          subtitle: 'Beautiful mountain view',
          order: 0
        },
        {
          rowId: row.id,
          url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
          title: 'Forest Path',
          subtitle: 'Peaceful forest trail',
          order: 1
        },
        {
          rowId: row.id,
          url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
          title: 'Sunset Vista',
          subtitle: 'Golden hour scenery',
          order: 2
        }
      ];

      await prodDb.insert(schema.images).values(sampleImages);
      console.log(`✅ Created ${sampleImages.length} sample images`);
    } else {
      console.log(`✅ Images already exist, skipping`);
    }

    console.log('🎉 Production database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Page: "${page.name}"`);
    console.log(`   - Row: "${row.title}"`);
    console.log(`   - Total images: ${(await prodDb.select().from(schema.images)).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedProduction();
