import { Router } from 'express';
import { 
  searchStudents, addRecord, getHistory, 
  createTask, 
  getClassMonitoring, getDailyDetails,
  generateAIStrategy, getTaskReport
} from '../controllers/contributorController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Tab 1
router.get('/search', verifyToken, searchStudents);
router.post('/record', verifyToken, addRecord);
router.get('/history', verifyToken, getHistory);

// Tab 2
router.post('/task', verifyToken, createTask);

// Tab 3
router.get('/monitoring', verifyToken, getClassMonitoring);
router.get('/monitoring/detail', verifyToken, getDailyDetails);

// Tab 4
router.post('/ai-strategy', verifyToken, generateAIStrategy);

router.get('/task/report', verifyToken, getTaskReport);

export default router;