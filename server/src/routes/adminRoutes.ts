import { Router } from 'express';
import { 
  getDashboardStats, 
  getAllUsers, 
  getUserById, // <-- Jangan lupa import ini
  deleteUser, 
  resetPassword,
  getSettings, 
  updateSettings, 
  broadcastMessage
} from '../controllers/adminController';
import { verifyToken } from '../middleware/auth'; // Pastikan middleware ini sesuai file Anda

const router = Router();

// Stats
router.get('/stats', verifyToken, getDashboardStats);

// Users Management
router.get('/users', verifyToken, getAllUsers);
router.get('/users/:id', verifyToken, getUserById); // <-- Route baru untuk mengatasi 404
router.delete('/users/:id', verifyToken, deleteUser);
router.post('/users/:id/reset-password', verifyToken, resetPassword);

// Settings & Broadcast
router.get('/settings', verifyToken, getSettings);
router.post('/settings', verifyToken, updateSettings);
router.post('/broadcast', verifyToken, broadcastMessage);

export default router;