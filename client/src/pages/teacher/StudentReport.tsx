import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Printer, ArrowLeft } from 'lucide-react';

export const StudentReport: React.FC = () => {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.post('/teacher/report-data', {
          student_id: studentId,
          start_date: start,
          end_date: end
        });
        setData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (start && end) fetchData();
  }, [studentId, start, end]);

  if (loading) return <div className="p-10 text-center">Menyiapkan Rapor...</div>;
  if (!data) return <div className="p-10 text-center">Data tidak ditemukan.</div>;

  // Helper Bar Component
  const ProfileBar = ({ label, score }: { label: string, score: number }) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</span>
        <span className="text-[10px] font-bold text-slate-800">{score}/100</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-200 print:border-slate-300">
        <div 
          className="bg-slate-800 h-2.5 rounded-full print:bg-slate-800" 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:p-0 print:bg-white">
      
      {/* Tombol Navigasi (Hilang saat print) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between print:hidden">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm text-xs font-bold hover:bg-slate-50">
          <ArrowLeft size={16} /> Kembali
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl shadow-lg text-xs font-bold uppercase hover:bg-indigo-700">
          <Printer size={16} /> Cetak Rapor
        </button>
      </div>

      {/* HALAMAN A4 */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-[1.5cm] shadow-2xl print:shadow-none print:w-full print:h-full">
        
        {/* KOP SURAT */}
        <div className="flex items-center gap-6 border-b-4 border-slate-800 pb-6 mb-8">
          <img src="/logosmpn6pekalongan.png" className="h-24 w-auto object-contain" />
          <div className="flex-1">
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none mb-1">SMP Negeri 6 Pekalongan</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Laporan Perkembangan Karakter & Kokurikuler</p>
            <p className="text-xs text-slate-400">Jl. RA. Kartini No.27, Keputran, Kec. Pekalongan Tim., Kota Pekalongan, Jawa Tengah 51128</p>
          </div>
        </div>

        {/* IDENTITAS */}
        <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200 print:bg-transparent print:border-slate-300">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Nama Peserta Didik</p>
            <p className="text-lg font-bold text-slate-800">{data.student.nama_lengkap}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Nomor Induk / Kelas</p>
            <p className="text-lg font-bold text-slate-800">{data.student.nomor_induk} / {data.student.kelas}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Periode Laporan</p>
            <p className="text-sm font-bold text-slate-800">{start} s.d. {end}</p>
          </div>
        </div>

        {/* 8 PROFIL LULUSAN */}
        <div className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-6">
            Capaian 8 Profil Lulusan
          </h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2">
            <ProfileBar label="Keimanan & Ketakwaan" score={data.profiles.keimanan} />
            <ProfileBar label="Kewargaan" score={data.profiles.kewargaan} />
            <ProfileBar label="Penalaran Kritis" score={data.profiles.penalaran} />
            <ProfileBar label="Kreativitas" score={data.profiles.kreativitas} />
            <ProfileBar label="Kolaborasi" score={data.profiles.kolaborasi} />
            <ProfileBar label="Kemandirian" score={data.profiles.kemandirian} />
            <ProfileBar label="Kesehatan" score={data.profiles.kesehatan} />
            <ProfileBar label="Komunikasi" score={data.profiles.komunikasi} />
          </div>
        </div>

        {/* NARASI DESKRIPSI (AI) */}
        <div className="mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200 print:bg-white print:border-slate-300">
          <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-3">
            Catatan Wali Kelas
          </h2>
          <p className="text-sm leading-relaxed text-justify text-slate-700 font-medium">
            {data.ai_narrative || "Siswa menunjukkan perkembangan yang stabil. Pertahankan kedisiplinan dan terus aktif dalam kegiatan sekolah."}
          </p>
        </div>

        {/* CATATAN PRESTASI & PELANGGARAN */}
        <div className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-2 mb-4">
            Rekam Jejak Khusus
          </h2>
          {data.records.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Tidak ada catatan khusus pada periode ini.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 font-black uppercase text-slate-500">Tanggal</th>
                  <th className="py-2 font-black uppercase text-slate-500">Kategori</th>
                  <th className="py-2 font-black uppercase text-slate-500">Keterangan</th>
                  <th className="py-2 font-black uppercase text-slate-500 text-right">Poin</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((rec: any) => (
                  <tr key={rec.id} className="border-b border-slate-100">
                    <td className="py-2">{new Date(rec.dibuat_pada).toLocaleDateString()}</td>
                    <td className="py-2 font-bold uppercase">{rec.kategori}</td>
                    <td className="py-2">{rec.judul}</td>
                    <td className={`py-2 text-right font-bold ${rec.poin > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {rec.poin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TANDA TANGAN */}
        <div className="mt-20 grid grid-cols-3 text-center text-xs font-bold text-slate-800 break-inside-avoid">
          <div>
            <p className="mb-16">Orang Tua / Wali</p>
            <p className="uppercase border-t border-slate-300 inline-block px-4 pt-1">.........................</p>
          </div>
          <div></div>
          <div>
            <p className="mb-16">Pekalongan, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}<br/>Wali Kelas</p>
            <p className="uppercase border-t border-slate-300 inline-block px-4 pt-1 font-black">.........................</p>
          </div>
        </div>

      </div>
    </div>
  );
};