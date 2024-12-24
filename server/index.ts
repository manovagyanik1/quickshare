import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { videoController } from './controllers/videoController';
import { VideoModel } from './models/video';

config();

// Initialize database tables
VideoModel.initTable();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://quickshare-one.vercel.app',
    process.env.VITE_FRONTEND_URL // Add your frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Routes
app.post('/api/videos', videoController.create);
app.get('/api/videos/:id/url', videoController.getUrl);
app.get('/api/videos/:id', videoController.getVideo);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});