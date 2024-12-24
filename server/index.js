import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Video } from './models/video.js';
import { videoRoutes } from './routes/videos.js';

dotenv.config();

// Initialize database tables
Video.initTable();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/videos', videoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});