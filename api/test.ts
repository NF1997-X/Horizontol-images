import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Simple test endpoint to debug the issue
    return res.json({
      status: 'ok',
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}