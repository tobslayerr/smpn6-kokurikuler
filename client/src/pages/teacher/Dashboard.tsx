import React, { useState, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, Check,  Printer, Users, 
  TrendingUp, AlertTriangle, Search, FileBarChart 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // State Utama
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Generate Header Tanggal untuk Tabel
  const datesHeader = useMemo(() => {
    if (!startDate || !endDate) return [];
    const dates = [];
    const curr = new Date(startDate);
    const last = new Date(endDate);
    while (curr <= last) {
      dates.push(new Date(curr).toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate, isDataLoaded]);

  // 2. Fetch Data Preview (Matriks)
  const handleCheck = async () => {
    if (!startDate || !endDate) return toast.error('Mohon pilih rentang tanggal.');
    
    setLoading(true);
    try {
      const res = await api.get(`/teacher/preview?start_date=${startDate}&end_date=${endDate}`);
      setPreviewData(res.data);
      setIsDataLoaded(true);
      toast.success('Data kelas berhasil dimuat');
    } catch (error) {
      toast.error('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  // 3. Helper Cek Status Cell
  const renderCellStatus = (studentJournals: any[], dateStr: string) => {
    const journal = studentJournals.find((j: any) => j.tanggal.split('T')[0] === dateStr);
    
    // Logic Prioritas: Sah Guru > Valid Ortu > Pending > Kosong
    if (!journal) {
      return (
        <div title="Tidak Mengisi" className="flex justify-center items-center h-full">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-200"></div>
        </div>
      );
    }
    
    if (journal.status_guru === 'approved') {
      return (
        <div title="Sah Wali Kelas" className="flex justify-center items-center h-full">
          <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm shadow-blue-200">
            <Check size={12} strokeWidth={4} />
          </div>
        </div>
      );
    }

    if (journal.status_ortu === 'approved') {
      return (
        <div title="Validasi Ortu OK" className="flex justify-center items-center h-full">
          <div className="w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center text-white shadow-sm shadow-emerald-200">
            <Check size={12} strokeWidth={4} />
          </div>
        </div>
      );
    }

    return (
      <div title="Sudah Isi (Pending)" className="flex justify-center items-center h-full">
        <div className="w-5 h-5 bg-slate-200 rounded-md flex items-center justify-center text-slate-500">
          <Check size={12} strokeWidth={4} />
        </div>
      </div>
    );
  };

  // 4. Hitung Statistik Ringkasan (Real-time dari data preview)
  const summary = useMemo(() => {
    if (previewData.length === 0) return { totalStudents: 0, avgFillRate: 0, lowParticipation: 0 };

    const totalStudents = previewData.length;
    const totalDays = datesHeader.length || 1;
    let totalFilledCount = 0;
    let lowParticipationCount = 0;

    previewData.forEach(student => {
      const filled = student.journals.length;
      totalFilledCount += filled;
      
      const rate = (filled / totalDays) * 100;
      if (rate < 50) lowParticipationCount++;
    });

    const avgFillRate = Math.round((totalFilledCount / (totalStudents * totalDays)) * 100);

    return { totalStudents, avgFillRate, lowParticipation: lowParticipationCount };
  }, [previewData, datesHeader]);

  // 5. Filter Pencarian Tabel
  const filteredData = previewData.filter(s => 
    s.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Ruang Wali Kelas {user?.kelas}</h2>
            <p className="opacity-80 text-sm font-medium">Panel Rekapitulasi & Validasi Jurnal Karakter</p>
          </div>
          <FileBarChart className="text-white/20" size={64} />
        </div>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
          <Calendar size={16} /> Filter Periode Laporan
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => { setStartDate(e.target.value); setIsDataLoaded(false); }} 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => { setEndDate(e.target.value); setIsDataLoaded(false); }} 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
            />
          </div>
          <button 
            onClick={handleCheck}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-black rounded-xl uppercase text-xs tracking-widest hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Memproses...' : 'Tampilkan Data'}
          </button>
        </div>
      </div>

      {/* HASIL DATA */}
      {isDataLoaded && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
          
          {/* STATISTIK RINGKASAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{summary.totalStudents}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Siswa</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{summary.avgFillRate}%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tingkat Partisipasi</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${summary.lowParticipation > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className={`text-2xl font-black ${summary.lowParticipation > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{summary.lowParticipation}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perlu Perhatian (&lt;50%)</p>
              </div>
            </div>
          </div>

          {/* TABEL MATRIKS */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden flex flex-col h-[600px]">
            
            {/* Header Tabel & Search */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-500">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded"></div> Sah Guru</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded"></div> Valid Ortu</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded"></div> Pending</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-rose-200 rounded-full"></div> Kosong</span>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari Siswa..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>
            
            {/* Scrollable Table Area */}
            <div className="flex-1 overflow-auto relative custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 shadow-sm">
                  <tr className="bg-slate-50 text-slate-500 text-[9px] uppercase font-black tracking-widest">
                    <th className="p-4 sticky left-0 bg-slate-50 z-30 border-r border-slate-200 min-w-[220px]">
                      Nama Siswa
                    </th>
                    {datesHeader.map(date => (
                      <th key={date} className="p-2 text-center border-r border-slate-100 min-w-[50px]">
                        {date.split('-')[2]}
                        <br/>
                        <span className="text-[8px] opacity-60">
                          {new Date(date).toLocaleDateString('id-ID', { month: 'short' })}
                        </span>
                      </th>
                    ))}
                    <th className="p-4 text-center sticky right-0 bg-slate-50 z-30 border-l border-slate-200 bg-opacity-95 backdrop-blur-sm">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-slate-700 divide-y divide-slate-50">
                  {filteredData.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-4 sticky left-0 bg-white hover:bg-indigo-50/30 z-10 border-r border-slate-200 font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                           <span className="text-slate-400 font-normal w-5 text-right">{idx + 1}.</span>
                           <div>
                             <p className="truncate w-32 md:w-40" title={student.nama_lengkap}>{student.nama_lengkap}</p>
                             <p className="text-[9px] text-slate-400 font-normal">{student.nomor_induk}</p>
                           </div>
                        </div>
                      </td>
                      {datesHeader.map(date => (
                        <td key={date} className="p-2 border-r border-slate-50">
                          {renderCellStatus(student.journals, date)}
                        </td>
                      ))}
                      <td className="p-2 sticky right-0 bg-white hover:bg-indigo-50/30 z-10 border-l border-slate-200 text-center shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <Link 
                          to={`/student-report/${student.id}?start=${startDate}&end=${endDate}`}
                          className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
                        >
                          <Printer size={14} /> Cetak
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};