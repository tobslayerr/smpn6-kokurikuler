import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Tambahkan 'kelas' di sini agar dikenali TypeScript secara global
export interface UserPayload {
  id: number;
  nomor_induk: string;
  peran: string;
  kelas?: string; // <--- TAMBAHAN
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ message: 'Akses ditolak. Token tidak tersedia.' });

  try {
    // Menghilangkan 'Bearer ' jika ada
    const tokenString = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
    
    const verified = jwt.verify(tokenString, process.env.JWT_SECRET as string) as UserPayload;
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token tidak valid' });
  }
};