import { Router } from 'express';
import { elementController } from '../controllers/elementController';

const router = Router({ mergeParams: true });

router.get('/', elementController.getByBoardId);
router.put('/', elementController.replaceAll);

export default router;
