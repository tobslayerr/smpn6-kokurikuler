import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export const createJournal = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { tanggal, data_kebiasaan } = req.body;
    const bukti_foto = req.file ? req.file.filename : null;
    
    // Pastikan format JSON string valid
    const habitsJson = typeof data_kebiasaan === 'string' ? data_kebiasaan : JSON.stringify(data_kebiasaan);

    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM jurnal_harian WHERE id_siswa = ? AND tanggal = ?',
      [req.user.id, tanggal]
    );

    if (existing.length > 0) {
      // Jika sudah ada, lakukan UPDATE data
      await pool.query<ResultSetHeader>(
        'UPDATE jurnal_harian SET data_kebiasaan = ?, bukti_foto = IFNULL(?, bukti_foto), diupdate_pada = NOW() WHERE id = ?',
        [habitsJson, bukti_foto, existing[0].id]
      );
      return res.status(200).json({ message: 'Jurnal berhasil diperbarui' });
    }

    await pool.query<ResultSetHeader>(
      'INSERT INTO jurnal_harian (id_siswa, tanggal, data_kebiasaan, bukti_foto) VALUES (?, ?, ?, ?)',
      [req.user.id, tanggal, habitsJson, bukti_foto]
    );

    res.status(201).json({ message: 'Jurnal berhasil disimpan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menyimpan jurnal', error });
  }
};

export const getMyJournals = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, tanggal, data_kebiasaan, bukti_foto, 
              status_ortu, catatan_ortu, 
              status_guru, catatan_guru 
       FROM jurnal_harian 
       WHERE id_siswa = ? 
       ORDER BY tanggal DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data', error });
  }
};

export const getJournalsByClass = async (req: Request, res: Response) => {
  try {
    const { kelas, tanggal } = req.query;
    
    // Logic: Ambil SEMUA siswa di kelas tersebut, lalu join dengan jurnal mereka pada tanggal tertentu
    // Gunakan LEFT JOIN agar siswa yang BELUM mengisi jurnal tetap muncul di daftar
    const query = `
      SELECT 
        u.id as user_id_from_user_table, 
        u.nama_lengkap, 
        u.nomor_induk, 
        j.id as id_jurnal,
        j.id_siswa,
        j.data_kebiasaan,
        j.bukti_foto,
        j.status_ortu,
        j.status_guru
      FROM pengguna u
      LEFT JOIN jurnal_harian j ON u.id = j.id_siswa AND j.tanggal = ?
      WHERE u.kelas = ? AND u.peran = 'siswa'
      ORDER BY u.nama_lengkap ASC
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [tanggal, kelas]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data kelas', error });
  }
};

export const validateJournal = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id_jurnal, status, catatan, tipe_validator } = req.body;

    // Tentukan kolom mana yang diupdate berdasarkan siapa yang memvalidasi
    let query = '';
    if (tipe_validator === 'parent') {
      query = 'UPDATE jurnal_harian SET status_ortu = ?, catatan_ortu = ?, waktu_validasi_ortu = NOW() WHERE id = ?';
    } else if (tipe_validator === 'teacher') {
      query = 'UPDATE jurnal_harian SET status_guru = ?, catatan_guru = ?, waktu_validasi_guru = NOW() WHERE id = ?';
    } else {
      return res.status(400).json({ message: 'Tipe validator tidak valid' });
    }

    await pool.query<ResultSetHeader>(query, [status, catatan, id_jurnal]);

    res.json({ message: 'Validasi berhasil disimpan' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memvalidasi', error });
  }
};