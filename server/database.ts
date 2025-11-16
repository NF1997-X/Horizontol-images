import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { Page, Row, GalleryImage, ShareLink } from "../shared/schema.js";
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema: schema });