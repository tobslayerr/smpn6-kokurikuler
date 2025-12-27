import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { sendWhatsapp } from '../utils/whatsapp';

// --- DASHBOARD & ANALYTICS ---
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Basic Stats
    const [userStats] = await pool.query<RowDataPacket[]>('SELECT peran, COUNT(*) as total FROM pengguna GROUP BY peran');
    
    // Activity Stats (Jurnal Hari Ini)
    const [todayJournals] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM jurnal_harian WHERE tanggal = CURDATE()');
    
    // Top Class (Kelas Paling Rajin bulan ini)
    const [topClass] = await pool.query<RowDataPacket[]>(
      `SELECT u.kelas, COUNT(j.id) as total_input 
       FROM jurnal_harian j 
       JOIN pengguna u ON j.id_siswa = u.id 
       WHERE MONTH(j.tanggal) = MONTH(CURRENT_DATE())
       GROUP BY u.kelas 
       ORDER BY total_input DESC 
       LIMIT 5`
    );

    const stats = {
      siswa: 0, guru: 0, ortu: 0,
      jurnal_hari_ini: todayJournals[0].total,
      top_classes: topClass
    };

    userStats.forEach((row: any) => {
      if (row.peran === 'siswa') stats.siswa = row.total;
      if (row.peran === 'wali_kelas' || row.peran === 'kontributor') stats.guru += row.total;
      if (row.peran === 'orang_tua') stats.ortu = row.total;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- USER MANAGEMENT ---

// 1. Get All Users (Pagination + Search + Fix Column Name)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Base Query Logic (WHERE clauses)
    let baseQuery = 'FROM pengguna';
    const params: any[] = [];
    const conditions: string[] = [];

    if (role) { 
      conditions.push('peran = ?'); 
      params.push(role); 
    }
    if (search) { 
      conditions.push('(nama_lengkap LIKE ? OR nomor_induk LIKE ?)'); 
      params.push(`%${search}%`, `%${search}%`); 
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    // FIX: Menggunakan 'dibuat_pada' bukan 'created_at'
    const dataQuery = `SELECT id, nama_lengkap, nomor_induk, peran, kelas, no_hp, dibuat_pada ${baseQuery} ORDER BY dibuat_pada DESC LIMIT ? OFFSET ?`;
    
    // Kita copy params agar params asli tidak terganggu untuk query count nanti
    const dataParams = [...params, Number(limit), offset];
    
    const [users] = await pool.query<RowDataPacket[]>(dataQuery, dataParams);

    // Query Total Data (untuk pagination)
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [totalResult] = await pool.query<RowDataPacket[]>(countQuery, params);
    
    const totalData = totalResult[0].total;
    const totalPages = Math.ceil(totalData / Number(limit));

    res.json({
      data: users,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalData,
        totalPages
      }
    });

  } catch (error) { 
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error fetching users' }); 
  }
};

// 2. Get Single User By ID (Fix Column Name)
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // FIX: Menggunakan 'dibuat_pada' bukan 'created_at'
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nama_lengkap, nomor_induk, peran, kelas, no_hp, dibuat_pada FROM pengguna WHERE id = ?', 
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting user detail:', error);
    res.status(500).json({ message: 'Database error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM pengguna WHERE id = ?', [id]);
    res.json({ message: 'User dihapus' });
  } catch (error) { res.status(500).json({ message: 'Gagal hapus' }); }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE pengguna SET kata_sandi = ? WHERE id = ?', [hash, id]);
    res.json({ message: 'Password direset' });
  } catch (error) { res.status(500).json({ message: 'Gagal reset' }); }
};

// --- SYSTEM SETTINGS ---
export const getSettings = async (req: Request, res: Response) => {
  try {
    const [settings] = await pool.query<RowDataPacket[]>('SELECT * FROM pengaturan_sistem WHERE kunci IN ("tahun_ajaran", "semester", "sekolah_nama")');
    const config: any = {};
    settings.forEach((s: any) => config[s.kunci] = s.nilai);
    res.json(config);
  } catch (error) { res.status(500).json({ message: 'Gagal ambil setting' }); }
};

export const updateSettings = async (req: Request, res: Response) => {
  const settings = req.body; 
  try {
    for (const key in settings) {
      if (['tahun_ajaran', 'semester', 'sekolah_nama'].includes(key)) {
        await pool.query('UPDATE pengaturan_sistem SET nilai = ? WHERE kunci = ?', [settings[key], key]);
      }
    }
    res.json({ message: 'Pengaturan disimpan' });
  } catch (error) { res.status(500).json({ message: 'Gagal simpan setting' }); }
};

// --- BROADCAST CENTER ---
export const broadcastMessage = async (req: Request, res: Response) => {
  const { target_role, message } = req.body;
  try {
    let query = 'SELECT no_hp, nama_lengkap FROM pengguna WHERE no_hp IS NOT NULL AND no_hp != ""';
    const params: any[] = [];
    if (target_role !== 'all') { query += ' AND peran = ?'; params.push(target_role); }
    const [recipients] = await pool.query<RowDataPacket[]>(query, params);

    if (recipients.length === 0) return res.status(404).json({ message: 'Tidak ada penerima dengan No HP aktif' });

    for (const user of recipients) {
      const personalizedMsg = `Halo ${user.nama_lengkap},\n\n${message}\n\n- Admin Sekolah`;
      sendWhatsapp(user.no_hp, personalizedMsg).catch(console.error);
    }
    res.json({ message: `Pesan dikirim ke ${recipients.length} orang.` });
  } catch (error) { res.status(500).json({ message: 'Gagal broadcast' }); }
};