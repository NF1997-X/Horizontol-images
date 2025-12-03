import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema.js';

// Dev database
const DEV_URL = 'postgresql://neondb_owner:npg_V9HXAN5dQJBw@ep-little-bird-ahdea2hb-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// Production database
const PROD_URL = 'postgresql://neondb_owner:npg_V9HXAN5dQJBw@ep-misty-haze-ahu4jh8e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const devSql = neon(DEV_URL);
const devDb = drizzle(devSql, { schema });

const prodSql = neon(PROD_URL);
const prodDb = drizzle(prodSql, { schema });

async function migrate() {
  console.log('🔄 Starting migration from dev to production...');

  try {
    // 1. Fetch all data from dev
    console.log('📥 Fetching data from dev database...');
    const pages = await devDb.select().from(schema.pages);
    const rows = await devDb.select().from(schema.rows);
    const images = await devDb.select().from(schema.images);
    const shareLinks = await devDb.select().from(schema.shareLinks);

    console.log(`Found: ${pages.length} pages, ${rows.length} rows, ${images.length} images, ${shareLinks.length} share links`);

    // 2. Insert into production in order (pages -> rows -> images -> shareLinks)
    if (pages.length > 0) {
      console.log('📤 Migrating pages...');
      for (const page of pages) {
        try {
          await prodDb.insert(schema.pages).values(page).onConflictDoNothing();
        } catch (err) {
          console.log(`  ⚠️  Skipping duplicate page: ${page.name}`);
        }
      }
      console.log('✅ Pages migrated');
    }

    if (rows.length > 0) {
      console.log('📤 Migrating rows...');
      for (const row of rows) {
        try {
          await prodDb.insert(schema.rows).values(row).onConflictDoNothing();
        } catch (err) {
          console.log(`  ⚠️  Skipping duplicate row: ${row.title}`);
        }
      }
      console.log('✅ Rows migrated');
    }

    if (images.length > 0) {
      console.log('📤 Migrating images...');
      for (const image of images) {
        try {
          await prodDb.insert(schema.images).values(image).onConflictDoNothing();
        } catch (err) {
          console.log(`  ⚠️  Skipping duplicate image: ${image.title}`);
        }
      }
      console.log('✅ Images migrated');
    }

    if (shareLinks.length > 0) {
      console.log('📤 Migrating share links...');
      for (const link of shareLinks) {
        try {
          await prodDb.insert(schema.shareLinks).values(link).onConflictDoNothing();
        } catch (err) {
          console.log(`  ⚠️  Skipping duplicate share link: ${link.shortCode}`);
        }
      }
      console.log('✅ Share links migrated');
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
