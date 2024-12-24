import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { createVideo, getVideo } from './controllers/videoController';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/videos', createVideo);
app.get('/api/videos/:id', getVideo);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});