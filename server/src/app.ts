import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import journalRoutes from './routes/journalRoutes';
import aiRoutes from './routes/aiRoutes';
import parentRoutes from './routes/parentRoutes';
import contributorRoutes from './routes/contributorRoutes';
import adminRoutes from './routes/adminRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://kokurikuler.smpn6pekalongan.org', 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/contributor', contributorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
  res.send('API Kokurikuler SMPN 6 Pekalongan is Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});