import { Router } from 'express';
import { getMyMissions, completeMission } from '../controllers/studentController'; // Import baru
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/missions', verifyToken, getMyMissions); // Route Baru
router.post('/missions/complete', verifyToken, completeMission); // Route Baru

export default router;