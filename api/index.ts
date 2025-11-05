import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize routes
let routesInitialized = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
  
  // Handle the request
  return new Promise((resolve) => {
    app(req as any, res as any, () => {
      resolve(undefined);
    });
  });
}