import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const register = async (req: Request, res: Response) => {
  const { nomor_induk, kata_sandi, nama_lengkap, peran, kelas, no_hp } = req.body;

  try {
    const [existingUser] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pengguna WHERE nomor_induk = ? OR (no_hp = ? AND no_hp IS NOT NULL)', 
      [nomor_induk, no_hp]
    );
    
    if (existingUser.length > 0) {
      if (existingUser[0].nomor_induk === nomor_induk) {
        return res.status(400).json({ message: 'Nomor Induk/ID sudah terdaftar' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(kata_sandi, salt);

    await pool.query<ResultSetHeader>(
      'INSERT INTO pengguna (nomor_induk, kata_sandi, nama_lengkap, peran, kelas, no_hp) VALUES (?, ?, ?, ?, ?, ?)',
      [nomor_induk, hashedPassword, nama_lengkap, peran || 'siswa', kelas, no_hp || null]
    );

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { nomor_induk, kata_sandi } = req.body;

  try {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM pengguna WHERE nomor_induk = ? OR no_hp = ?', 
      [nomor_induk, nomor_induk]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Akun tidak ditemukan' });
    }

    let validUser = null;
    for (const user of users) {
      const isMatch = await bcrypt.compare(kata_sandi, user.kata_sandi);
      if (isMatch) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      return res.status(400).json({ message: 'Kata sandi salah' });
    }

    // PERBAIKAN DI SINI: Menambahkan 'kelas' ke dalam token
    const token = jwt.sign(
      { 
        id: validUser.id, 
        nomor_induk: validUser.nomor_induk, 
        peran: validUser.peran,
        kelas: validUser.kelas // <--- PENTING: Agar TeacherController bisa membacanya
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: validUser.id,
        nama: validUser.nama_lengkap,
        peran: validUser.peran,
        kelas: validUser.kelas
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, nomor_induk, nama_lengkap, peran, kelas, foto_profil, no_hp FROM pengguna WHERE id = ?', 
      [req.user.id]
    );

    if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};