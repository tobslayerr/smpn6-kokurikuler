import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Definisi interface agar TypeScript mengenali properti kelas
interface AuthenticatedUser {
  id: number;
  peran: string;
  kelas?: string;
}

// Helper Hitung Skor 8 Profil
const calculateProfiles = (journals: any[]) => {
  const scores = {
    keimanan: 0, kewargaan: 0, penalaran: 0, kreativitas: 0,
    kolaborasi: 0, kemandirian: 0, kesehatan: 0, komunikasi: 0
  };

  journals.forEach(j => {
    const d = JSON.parse(j.data_kebiasaan || '{}');
    
    if (d.ibadah_list?.length > 0) scores.keimanan += 10;
    if (d.sosial_aksi) { scores.kewargaan += 5; scores.kolaborasi += 5; }
    if (d.belajar_mapel) scores.penalaran += 5;
    if (d.belajar_ekskul) scores.kreativitas += 5;
    if (d.jam_bangun && d.jam_tidur) scores.kemandirian += 5;
    if (d.olahraga_jenis || d.makan_sehat) scores.kesehatan += 10;
    if (d.sosial_aksi && d.sosial_aksi.includes('Diskusi')) scores.komunikasi += 10;
    else scores.komunikasi += 2; 
  });

  const maxScore = Math.max(journals.length * 10, 10);
  const normalize = (val: number) => Math.min(Math.round((val / maxScore) * 100), 100);

  return {
    keimanan: normalize(scores.keimanan),
    kewargaan: normalize(scores.kewargaan),
    penalaran: normalize(scores.penalaran),
    kreativitas: normalize(scores.kreativitas),
    kolaborasi: normalize(scores.kolaborasi),
    kemandirian: normalize(scores.kemandirian),
    kesehatan: normalize(scores.kesehatan),
    komunikasi: normalize(scores.komunikasi)
  };
};

export const getClassPreview = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    
    // PERBAIKAN DI SINI: Casting req.user agar TS mengenali 'kelas'
    const user = req.user as AuthenticatedUser;
    const kelas = user?.kelas;

    if (!kelas) return res.status(400).json({ message: 'Kelas tidak ditemukan atau Anda bukan Wali Kelas' });

    // 1. Ambil Siswa
    const [students] = await pool.query<RowDataPacket[]>(
      'SELECT id, nama_lengkap, nomor_induk FROM pengguna WHERE kelas = ? AND peran = "siswa" ORDER BY nama_lengkap ASC',
      [kelas]
    );

    // 2. Ambil Jurnal dalam Rentang
    const [journals] = await pool.query<RowDataPacket[]>(
      `SELECT id_siswa, tanggal, status_ortu, status_guru 
       FROM jurnal_harian 
       WHERE tanggal BETWEEN ? AND ?`,
      [start_date, end_date]
    );

    // 3. Mapping Matriks
    const previewData = students.map(s => {
      const studentJournals = journals.filter(j => j.id_siswa === s.id);
      return {
        ...s,
        journals: studentJournals, 
        total_filled: studentJournals.length
      };
    });

    res.json(previewData);
  } catch (error) {
    console.error(error); // Log error agar mudah debug
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getStudentReportData = async (req: Request, res: Response) => {
  const { student_id, start_date, end_date } = req.body;

  try {
    const [student] = await pool.query<RowDataPacket[]>(
      'SELECT nama_lengkap, kelas, nomor_induk, foto_profil FROM pengguna WHERE id = ?', 
      [student_id]
    );
    
    const [journals] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM jurnal_harian WHERE id_siswa = ? AND tanggal BETWEEN ? AND ? ORDER BY tanggal ASC',
      [student_id, start_date, end_date]
    );

    const [records] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM catatan_kontributor WHERE id_siswa = ?',
      [student_id]
    );

    const profiles = calculateProfiles(journals);

    let aiNarrative = "";
    if (process.env.GEMINI_API_KEY && journals.length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Buat narasi rapor singkat (max 50 kata) untuk siswa ${student[0].nama_lengkap} berdasarkan profil karakter: ${JSON.stringify(profiles)}. Bernada positif dan memotivasi.`;
        const result = await model.generateContent(prompt);
        aiNarrative = result.response.text();
      } catch (e) { aiNarrative = "Catatan wali kelas belum digenerate."; }
    }

    res.json({
      student: student[0],
      journals,
      records,
      profiles,
      ai_narrative: aiNarrative
    });

  } catch (error) {
    res.status(500).json({ message: 'Gagal generate rapor' });
  }
};