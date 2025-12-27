import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { sendWhatsapp } from '../utils/whatsapp';

export const getMyMissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    // Logic: Ambil tugas yang targetnya 'kelas' siswa INI ATAU targetnya 'individu' ID siswa INI
    // DAN siswa belum ada di tabel tugas_penyelesaian
    const query = `
      SELECT t.*, u.nama_lengkap as pembuat
      FROM tugas_karakter t
      JOIN pengguna u ON t.id_pembuat = u.id
      WHERE 
        (
          (t.target_tipe = 'kelas' AND t.target_id = ?) 
          OR 
          (t.target_tipe = 'individu' AND t.target_id = ?)
        )
        AND t.id NOT IN (
          SELECT id_tugas FROM tugas_penyelesaian WHERE id_siswa = ?
        )
      ORDER BY t.tanggal_tugas DESC
    `;

    // Kita butuh data kelas user. Jika di token tidak ada, query dulu.
    // Asumsi req.user.kelas ada (dari update auth sebelumnya). Jika tidak, ambil dari DB.
    let userClass = req.user.kelas;
    if(!userClass) {
        const [userData] = await pool.query<RowDataPacket[]>('SELECT kelas FROM pengguna WHERE id = ?', [req.user.id]);
        userClass = userData[0]?.kelas;
    }

    const [missions] = await pool.query<RowDataPacket[]>(query, [userClass, req.user.id, req.user.id]);
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil misi' });
  }
};

export const completeMission = async (req: Request, res: Response) => {
  const { id_tugas, refleksi } = req.body;
  const XP_REWARD = 50; // Poin per misi
  
  const connection = await pool.getConnection(); // Pakai transaction biar aman

  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    await connection.beginTransaction();

    // 1. Simpan Penyelesaian & Refleksi
    await connection.query<ResultSetHeader>(
      'INSERT INTO tugas_penyelesaian (id_tugas, id_siswa, refleksi_siswa) VALUES (?, ?, ?)',
      [id_tugas, req.user.id, refleksi]
    );

    // 2. Tambah XP Siswa (Gamifikasi)
    await connection.query(
      'UPDATE pengguna SET xp = xp + ? WHERE id = ?',
      [XP_REWARD, req.user.id]
    );

    // 3. Ambil Data Tugas & No HP Orang Tua untuk Notifikasi
    const [taskData] = await connection.query<RowDataPacket[]>(
      'SELECT judul_materi FROM tugas_karakter WHERE id = ?', [id_tugas]
    );

    const [parentData] = await connection.query<RowDataPacket[]>(
      `SELECT p.no_hp, p.nama_lengkap 
       FROM hubungan_orangtua_anak h
       JOIN pengguna p ON h.id_orangtua = p.id
       WHERE h.id_siswa = ?`,
      [req.user.id]
    );

    // 4. Kirim WA ke Orang Tua (Reaksi Berantai)
    if (parentData.length > 0 && parentData[0].no_hp && process.env.FONNTE_TOKEN) {
      const taskTitle = taskData[0]?.judul_materi || 'Tantangan Karakter';
      const message = `🎉 *Laporan Prestasi Siswa*\n\nHalo Bpk/Ibu ${parentData[0].nama_lengkap},\n\nAnanda baru saja menyelesaikan misi: *"${taskTitle}"* di aplikasi Kokurikuler.\n\nRefleksi Ananda: _"${refleksi}"_\n\nMohon berikan apresiasi kepada Ananda saat bertemu nanti ya! Terima kasih.\n\n- SMPN 6 Pekalongan`;
      
      // Kirim Async (jangan tunggu response agar UI cepat)
      sendWhatsapp(parentData[0].no_hp, message).catch(err => console.error("WA Error:", err));
    }

    await connection.commit();
    res.json({ message: `Misi Selesai! +${XP_REWARD} XP ditambahkan ke profilmu.` });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Gagal menyelesaikan misi' });
  } finally {
    connection.release();
  }
};