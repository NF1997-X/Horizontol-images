import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { updateRowSchema } from '../../shared/schema';
import { z } from 'zod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { rowId } = req.query;
    
    if (req.method === 'GET') {
      // Get row from database
      const row = await storage.getRow(rowId as string);
      if (!row) {
        return res.status(404).json({ error: 'Row not found' });
      }
      return res.json(row);
    }
    
    if (req.method === 'PATCH') {
      // Update row in database
      const data = updateRowSchema.parse(req.body);
      const row = await storage.updateRow(rowId as string, data);
      if (!row) {
        return res.status(404).json({ error: 'Row not found' });
      }
      return res.json(row);
    }
    
    if (req.method === 'DELETE') {
      // Delete row from database
      await storage.deleteRow(rowId as string);
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Individual Row API Error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
}