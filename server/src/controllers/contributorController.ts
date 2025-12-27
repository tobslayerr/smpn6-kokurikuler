import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- TAB 1: OBSERVASI (Existing) ---
export const searchStudents = async (req: Request, res: Response) => {
  const { query, kelas } = req.query;
  try {
    let sql = 'SELECT id, nama_lengkap, nomor_induk, kelas FROM pengguna WHERE peran = "siswa"';
    const params: any[] = [];

    if (kelas) {
      sql += ' AND kelas = ?';
      params.push(kelas);
    }
    if (query) {
      sql += ' AND (nama_lengkap LIKE ? OR nomor_induk LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    sql += ' LIMIT 20';

    const [students] = await pool.query<RowDataPacket[]>(sql, params);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mencari siswa' });
  }
};

export const addRecord = async (req: Request, res: Response) => {
  const { student_id, kategori, judul, deskripsi, poin } = req.body;
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    let finalPoint = parseInt(poin);
    if (kategori === 'pelanggaran' && finalPoint > 0) finalPoint = -finalPoint;

    await pool.query<ResultSetHeader>(
      'INSERT INTO catatan_kontributor (id_siswa, id_pencatat, kategori, judul, deskripsi, poin) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, req.user.id, kategori, judul, deskripsi, finalPoint]
    );
    res.status(201).json({ message: 'Catatan berhasil disimpan' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyimpan catatan' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const [records] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, s.nama_lengkap as nama_siswa, s.kelas 
       FROM catatan_kontributor c JOIN pengguna s ON c.id_siswa = s.id
       WHERE c.id_pencatat = ? ORDER BY c.dibuat_pada DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil riwayat' });
  }
};

// --- TAB 2: MATERI / TANTANGAN ---
export const createTask = async (req: Request, res: Response) => {
  const { target_tipe, target_id, kategori_kebiasaan, judul_materi, isi_materi, tanggal_tugas } = req.body;
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    await pool.query<ResultSetHeader>(
      'INSERT INTO tugas_karakter (id_pembuat, target_tipe, target_id, kategori_kebiasaan, judul_materi, isi_materi, tanggal_tugas) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, target_tipe, target_id, kategori_kebiasaan, judul_materi, isi_materi, tanggal_tugas]
    );
    res.status(201).json({ message: 'Materi karakter berhasil didistribusikan' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat tugas' });
  }
};

// --- TAB 3: MONITORING KELAS (HEATMAP) ---
export const getClassMonitoring = async (req: Request, res: Response) => {
  const { kelas, month, year } = req.query; // month: 1-12, year: 2025
  try {
    if (!kelas) return res.status(400).json({ message: 'Kelas diperlukan' });

    // 1. Hitung Total Siswa di Kelas
    const [students] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM pengguna WHERE kelas = ? AND peran = "siswa"',
      [kelas]
    );
    const totalStudents = students[0].total || 0;

    if (totalStudents === 0) return res.json({ stats: [], daily: {} });

    // 2. Ambil Statistik Jurnal per Tanggal di Bulan tersebut
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const [journals] = await pool.query<RowDataPacket[]>(
      `SELECT j.tanggal, COUNT(DISTINCT j.id_siswa) as filled_count
       FROM jurnal_harian j
       JOIN pengguna p ON j.id_siswa = p.id
       WHERE p.kelas = ? AND j.tanggal BETWEEN ? AND ?
       GROUP BY j.tanggal`,
      [kelas, startDate, endDate]
    );

    // 3. Format Data untuk Heatmap
    const dailyStats: Record<string, string> = {}; // "YYYY-MM-DD": "high" | "med" | "low"
    
    journals.forEach((j: any) => {
      const dateStr = new Date(j.tanggal).toISOString().split('T')[0];
      const percentage = (j.filled_count / totalStudents) * 100;
      
      let level = 'low';
      if (percentage > 75) level = 'high';
      else if (percentage > 40) level = 'med';
      
      dailyStats[dateStr] = level;
    });

    res.json({ dailyStats, totalStudents });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat monitoring' });
  }
};

export const getDailyDetails = async (req: Request, res: Response) => {
  const { kelas, date } = req.query;
  try {
    // Ambil semua siswa di kelas + status jurnal mereka pada tanggal tsb
    const [data] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.nama_lengkap, j.status_ortu, j.status_guru, j.id as jurnal_id
       FROM pengguna u
       LEFT JOIN jurnal_harian j ON u.id = j.id_siswa AND j.tanggal = ?
       WHERE u.kelas = ? AND u.peran = "siswa"
       ORDER BY u.nama_lengkap ASC`,
      [date, kelas]
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal detail harian' });
  }
};

export const generateAIStrategy = async (req: Request, res: Response) => {
  const { student_id, date } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'API Key AI tidak ditemukan' });
  }

  try {
    const [student] = await pool.query<RowDataPacket[]>('SELECT nama_lengkap, kelas FROM pengguna WHERE id = ?', [student_id]);
    const [journal] = await pool.query<RowDataPacket[]>('SELECT data_kebiasaan FROM jurnal_harian WHERE id_siswa = ? AND tanggal = ?', [student_id, date]);

    const studentName = student[0]?.nama_lengkap || 'Siswa';
    const isFilled = journal.length > 0;
    const habits = isFilled ? JSON.parse(journal[0].data_kebiasaan) : null;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // PROMPT BARU YANG LEBIH NATURAL & HUMANIS
    const prompt = `
      Berperanlah sebagai seorang Psikolog Pendidikan Senior dan Mentor yang bijaksana, hangat, dan empatik.
      Tugasmu adalah memberikan strategi "Deep Learning" (Pembelajaran Karakter Mendalam) untuk guru berdasarkan data siswa.

      DATA SISWA:
      - Nama: ${studentName}
      - Tanggal: ${date}
      - Status Jurnal: ${isFilled ? 'Mengisi Jurnal' : 'TIDAK Mengisi / Kosong'}
      ${isFilled ? `- Detail Isi: ${JSON.stringify(habits)}` : ''}

      INSTRUKSI GAYA BAHASA:
      1. Gunakan Bahasa Indonesia yang luwes, profesional, namun menyentuh hati (seperti berbicara tatap muka).
      2. Hindari kata-kata robotik seperti "Berdasarkan data di atas...". Langsung masuk ke inti permasalahan dengan sapaan hangat.
      3. Fokus pada "Internalisasi Nilai", bukan sekadar kepatuhan mengisi data.

      FORMAT OUTPUT (Gunakan Markdown):
      
      ### 🧭 Analisis Kontekstual
      (Berikan pandanganmu tentang situasi siswa ini. Jika dia tidak mengisi, jangan menghakimi, tapi gali potensi penyebab psikologisnya (misal: lelah, lupa, atau demotivasi). Jika mengisi, apresiasi konsistensinya.)

      ### 💡 Intervensi Sokratik
      (Berikan 1 pertanyaan pemantik yang bisa diajukan guru ke siswa untuk menggugah kesadaran dirinya. Gunakan format kutipan/blockquote.)
      > "Contoh pertanyaan..."

      ### 🌱 Strategi Micro-Habit
      (Saran aksi yang sangat kecil, konkret, dan mudah dilakukan siswa besok pagi. Jangan saran yang muluk-muluk.)
      * **Aksi:** ...
      * **Tujuan:** ...

      ### 🤝 Koneksi Sosial
      (Satu ide sederhana agar karakter siswa ini bisa berdampak bagi teman sekelas atau orang tuanya.)

      ---
      **Pesan untuk Guru:** (Satu kalimat penyemangat singkat untuk guru yang membaca ini).
    `;

    const result = await model.generateContent(prompt);
    res.json({ strategy: result.response.text() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal generate strategi AI' });
  }
};

export const getTaskReport = async (req: Request, res: Response) => {
  const { task_id } = req.query;
  try {
    const [results] = await pool.query<RowDataPacket[]>(
      `SELECT tp.*, u.nama_lengkap, u.kelas, u.foto_profil
       FROM tugas_penyelesaian tp
       JOIN pengguna u ON tp.id_siswa = u.id
       WHERE tp.id_tugas = ?
       ORDER BY tp.tanggal_selesai DESC`,
      [task_id]
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memuat laporan tugas' });
  }
};