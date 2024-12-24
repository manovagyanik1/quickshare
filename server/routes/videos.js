import { Router } from 'express';
import { videoController } from '../controllers/videoController.js';

const router = Router();

router.post('/', videoController.create);
router.get('/:id', videoController.getUrl);

export const videoRoutes = router;