import { Router } from 'express';
import boardRoutes from './boardRoutes';

const router = Router();

router.use('/boards', boardRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
