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

// For Vercel serverless deployment
export default app;