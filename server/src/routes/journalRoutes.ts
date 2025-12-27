import { Router } from 'express';
import { createJournal, getMyJournals, getJournalsByClass, validateJournal } from '../controllers/journalController';
import { verifyToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', verifyToken, upload.single('bukti_foto'), createJournal);
router.get('/my', verifyToken, getMyJournals);
router.get('/class', verifyToken, getJournalsByClass);
router.post('/validate', verifyToken, validateJournal);

export default router;