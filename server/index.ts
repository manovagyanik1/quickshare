import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { videoController } from './controllers/videoController';
import { VideoModel } from './models/video';

config();

// Initialize database tables
VideoModel.initTable();

const app = express();

// Configure CORS for production
app.use(cors({
  origin: process.env.VERCEL_URL 
    ? [`https://${process.env.VERCEL_URL}`, 'https://screencast.app']
    : '*',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (_, res) => res.send('OK'));

// Routes
app.post('/api/videos', videoController.create);
app.get('/api/videos/:id/url', videoController.getUrl);
app.get('/api/videos/:id', videoController.getVideo);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// For Vercel serverless deployment
export default app;