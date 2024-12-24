import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { videoController } from './controllers/videoController';

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/videos', videoController.create);
app.get('/api/videos/:id', videoController.getUrl);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});