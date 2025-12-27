import { Router } from 'express';
import { linkStudent, getChildren, remindChild, getChildProfile } from '../controllers/parentController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/link', verifyToken, linkStudent);
router.get('/children', verifyToken, getChildren);
router.post('/remind', verifyToken, remindChild);
router.get('/child/:student_id', verifyToken, getChildProfile);

export default router;