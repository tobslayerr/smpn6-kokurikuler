import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai'; // <--- PERBAIKAN DI SINI
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export const generateReport = async (req: Request, res: Response) => {
  const { student_id, start_date, end_date } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'API Key AI belum dikonfigurasi' });
  }

  try {
    const [student] = await pool.query<RowDataPacket[]>(
      'SELECT nama_lengkap, kelas FROM pengguna WHERE id = ?', 
      [student_id]
    );

    if (student.length === 0) return res.status(404).json({ message: 'Siswa tidak ditemukan' });

    const [journals] = await pool.query<RowDataPacket[]>(
      'SELECT tanggal, data_kebiasaan, skor_mood FROM jurnal_harian WHERE id_siswa = ? AND tanggal BETWEEN ? AND ? ORDER BY tanggal ASC',
      [student_id, start_date, end_date]
    );

    if (journals.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data jurnal pada rentang tanggal ini' });
    }

    const journalSummary = journals.map(j => ({
      date: j.tanggal,
      habits: j.data_kebiasaan,
      mood: j.skor_mood
    }));

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    
    const prompt = `
      Bertindaklah sebagai Wali Kelas SMP. Analisis data jurnal karakter siswa berikut ini:
      Nama: ${student[0].nama_lengkap}
      Kelas: ${student[0].kelas}
      Data Jurnal: ${JSON.stringify(journalSummary)}

      Tugas: Buat narasi deskripsi rapor karakter (maksimal 2 paragraf) yang profesional, mengapresiasi kelebihan, dan memberi saran perbaikan yang sopan. Gunakan Bahasa Indonesia formal.
      
      Format Output JSON Murni (Tanpa markdown block):
      {
        "ringkasan": "Ringkasan performa...",
        "saran": "Saran perbaikan...",
        "narasi_rapor": "Narasi lengkap untuk rapor..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Pembersihan string JSON (terkadang AI membungkus dengan ```json ... ```)
    let textResponse = response.text();
    textResponse = textResponse.replace(/^```json/g, '').replace(/```$/g, '').trim();

    const finalResult = JSON.parse(textResponse);

    res.json(finalResult);

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: 'Gagal memproses AI', error });
  }
};