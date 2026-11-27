// Vercel serverless entry.
// Routes /api/* (and the SPA) through the existing Express app defined in
// ../server.ts. All Gemini / concierge / translator / planner endpoints are
// served from here. Set GEMINI_API_KEY in the Vercel project environment.
import app from '../server';

export default app;