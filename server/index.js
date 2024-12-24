import { config } from 'dotenv';
// Load environment variables first
config();

import express from 'express';
import cors from 'cors';
import { videoController } from './controllers/videoController.js';
import { VideoModel } from './models/video.js';

// Initialize database tables
VideoModel.initTable();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Create router for /api routes
const apiRouter = express.Router();

// Routes
apiRouter.post('/videos', videoController.create);
apiRouter.get('/videos/:id/url', videoController.getUrl);
apiRouter.get('/videos/:id', videoController.getVideo);
apiRouter.get('/health', (_, res) => res.send('OK'));

// Mount the router under /api
app.use('/api', apiRouter);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app; 