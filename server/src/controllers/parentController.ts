import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { sendWhatsapp } from '../utils/whatsapp';

export const linkStudent = async (req: Request, res: Response) => {
  const { nis_siswa } = req.body;
  
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const [students] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM pengguna WHERE nomor_induk = ? AND peran = "siswa"',
      [nis_siswa]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Siswa dengan NIS tersebut tidak ditemukan' });
    }

    const studentId = students[0].id;

    await pool.query<ResultSetHeader>(
      'INSERT INTO hubungan_orangtua_anak (id_orangtua, id_siswa) VALUES (?, ?)',
      [req.user.id, studentId]
    );

    res.json({ message: 'Berhasil menghubungkan akun anak' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghubungkan data (Mungkin sudah terhubung)' });
  }
};

export const getChildren = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const today = new Date().toISOString().split('T')[0];

    // Query diperbarui untuk membaca status_ortu langsung dari jurnal_harian
    const [children] = await pool.query<RowDataPacket[]>(
      `SELECT p.id, p.nama_lengkap, p.nomor_induk, p.kelas, p.no_hp,
       j.id as journal_id, j.status_ortu, j.status_guru, 
       j.data_kebiasaan, j.bukti_foto  -- <--- TAMBAHKAN INI
       FROM hubungan_orangtua_anak h
       JOIN pengguna p ON h.id_siswa = p.id
       LEFT JOIN jurnal_harian j ON p.id = j.id_siswa AND j.tanggal = ?
       WHERE h.id_orangtua = ?`,
      [today, req.user.id]
    );

    res.json(children);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data anak' });
  }
};

export const remindChild = async (req: Request, res: Response) => {
  const { student_id } = req.body;

  try {
    const [student] = await pool.query<RowDataPacket[]>(
      'SELECT nama_lengkap, no_hp FROM pengguna WHERE id = ?', 
      [student_id]
    );

    if (student.length === 0 || !student[0].no_hp) {
      return res.status(400).json({ message: 'Nomor HP siswa tidak terdaftar' });
    }

    const message = `Halo ${student[0].nama_lengkap}, Ayah/Ibu melihat kamu belum mengisi Jurnal Kokurikuler hari ini. Yuk diisi sekarang agar poin karaktermu meningkat! Semangat!`;
    
    await sendWhatsapp(student[0].no_hp, message);

    res.json({ message: 'Pengingat WhatsApp berhasil dikirim' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengirim WA' });
  }
};

export const getChildProfile = async (req: Request, res: Response) => {
  const { student_id } = req.params;

  try {
    // 1. Validasi apakah ini benar anak dari orang tua yang login
    const [relation] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM hubungan_orangtua_anak WHERE id_orangtua = ? AND id_siswa = ?',
      [req.user?.id, student_id]
    );

    if (relation.length === 0) return res.status(403).json({ message: 'Akses ditolak' });

    // 2. Ambil Data Siswa
    const [student] = await pool.query<RowDataPacket[]>(
      'SELECT nama_lengkap, nomor_induk, kelas, foto_profil, no_hp FROM pengguna WHERE id = ?',
      [student_id]
    );

    // 3. Ambil Riwayat Jurnal (Sebulan terakhir)
    const [journals] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM jurnal_harian WHERE id_siswa = ? ORDER BY tanggal DESC LIMIT 31',
      [student_id]
    );

    // 4. Ambil Catatan Guru (Poin Prestasi/Pelanggaran)
    const [records] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, p.nama_lengkap as nama_pencatat, p.peran as peran_pencatat 
       FROM catatan_kontributor c
       JOIN pengguna p ON c.id_pencatat = p.id
       WHERE c.id_siswa = ? ORDER BY c.dibuat_pada DESC`,
      [student_id]
    );

    // 5. Hitung Statistik Sederhana
    const stats = {
      total_jurnal: journals.length,
      poin_positif: records.filter((r: any) => r.poin > 0).reduce((a: number, b: any) => a + b.poin, 0),
      poin_negatif: records.filter((r: any) => r.poin < 0).reduce((a: number, b: any) => a + Math.abs(b.poin), 0),
    };

    res.json({
      profile: student[0],
      journals,
      records,
      stats
    });

  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat profil anak' });
  }
};