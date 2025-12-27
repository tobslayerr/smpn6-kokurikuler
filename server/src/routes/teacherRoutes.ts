import { Router } from 'express';
import { getClassPreview, getStudentReportData } from '../controllers/teacherController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get('/preview', verifyToken, getClassPreview);
router.post('/report-data', verifyToken, getStudentReportData);

export default router;