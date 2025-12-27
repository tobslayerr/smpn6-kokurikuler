import { Router } from 'express';
import { generateReport } from '../controllers/aiController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/report', verifyToken, generateReport);

export default router;