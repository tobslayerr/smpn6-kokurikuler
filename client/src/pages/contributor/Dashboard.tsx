import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, PlusCircle, Trophy, AlertTriangle, Activity, History, 
  BookOpen, Calendar, ChevronLeft, ChevronRight, Send, Sparkles, 
  BrainCircuit, X, User, Quote, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

// --- DATA STATIS ---
const LIST_KELAS = ['7A','7B','7C','7D','7E','7F','7G','8A','8B','8C','8D','8E','8F','8G','8H','9A','9B','9C','9D','9E','9F','9G'];
const LIST_HABIT = ['Bangun Pagi', 'Beribadah', 'Berolahraga', 'Makan Sehat & Bergizi', 'Gemar Belajar', 'Bermasyarakat', 'Tidur Cepat'];

export const ContributorDashboard: React.FC = () => {
  // FIX 1: Variabel user sekarang digunakan di Header
  const { user } = useAuth(); 
  const [activeTab, setActiveTab] = useState<'observasi' | 'materi' | 'monitoring' | 'ai'>('observasi');

  // === STATE: OBSERVASI ===
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [formObs, setFormObs] = useState({ kategori: 'prestasi', judul: '', deskripsi: '', poin: 0 });

  // === STATE: MATERI (QUEST) ===
  // FIX 2: Menghapus myTasks dan setMyTasks yang tidak terpakai
  const [formMat, setFormMat] = useState({ target_tipe: 'kelas', target_id: '7A', kategori_kebiasaan: 'Bangun Pagi', judul_materi: '', isi_materi: '', tanggal_tugas: new Date().toISOString().split('T')[0] });
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [taskReport, setTaskReport] = useState<any[]>([]);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');

  // === STATE: MONITORING ===
  const [monKelas, setMonKelas] = useState('7A');
  const [monMonth, setMonMonth] = useState(new Date());
  const [monData, setMonData] = useState<{dailyStats: Record<string, string>, totalStudents: number}>({ dailyStats: {}, totalStudents: 0 });
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any[]>([]);

  // === STATE: AI COACH ===
  const [aiStudent, setAiStudent] = useState<any>(null);
  const [aiDate, setAiDate] = useState(new Date().toISOString().split('T')[0]);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // === EFFECTS ===
  useEffect(() => {
    if (activeTab === 'observasi') fetchHistory();
    if (activeTab === 'monitoring') fetchMonitoring();
  }, [activeTab, monKelas, monMonth]);

  // === LOGIC: COMMON ===
  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      try {
        const res = await api.get(`/contributor/search?query=${q}`);
        setSearchResults(res.data);
      } catch (e) { console.error(e); }
    } else setSearchResults([]);
  };

  // === LOGIC: OBSERVASI ===
  const fetchHistory = async () => {
    try { const res = await api.get('/contributor/history'); setHistory(res.data); } catch (e) {}
  };

  const submitObservasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await api.post('/contributor/record', { student_id: selectedStudent.id, ...formObs });
      toast.success('Poin berhasil dicatat!');
      setFormObs({ kategori: 'prestasi', judul: '', deskripsi: '', poin: 0 });
      setSelectedStudent(null);
      setSearchQuery('');
      fetchHistory();
    } catch (e) { toast.error('Gagal menyimpan data'); }
  };

  // === LOGIC: MATERI ===
  const submitMateri = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/contributor/task', formMat);
      toast.success('Materi & Misi berhasil didistribusikan!');
      setFormMat({ ...formMat, judul_materi: '', isi_materi: '' });
    } catch (e) { toast.error('Gagal mengirim materi'); }
  };

  const openTaskReport = async (taskId: number, title: string) => {
    setSelectedTaskTitle(title);
    setReportModalOpen(true);
    try {
      const res = await api.get(`/contributor/task/report?task_id=${taskId}`);
      setTaskReport(res.data);
    } catch (e) { toast.error('Gagal memuat laporan'); }
  };

  // === LOGIC: MONITORING ===
  const fetchMonitoring = async () => {
    try {
      const res = await api.get(`/contributor/monitoring?kelas=${monKelas}&month=${monMonth.getMonth() + 1}&year=${monMonth.getFullYear()}`);
      setMonData({ dailyStats: res.data.dailyStats || {}, totalStudents: res.data.totalStudents || 0 });
    } catch (e) {}
  };

  const fetchDailyDetail = async (dateStr: string) => {
    setSelectedDateDetail(dateStr);
    try {
      const res = await api.get(`/contributor/monitoring/detail?kelas=${monKelas}&date=${dateStr}`);
      setStudentDetails(res.data);
    } catch (e) {}
  };

  const daysInMonth = useMemo(() => {
    const year = monMonth.getFullYear();
    const month = monMonth.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [monMonth]);

  // === LOGIC: AI ===
  const generateStrategy = async () => {
    if (!aiStudent) return toast.error('Pilih siswa dulu');
    setAiLoading(true);
    try {
      const res = await api.post('/contributor/ai-strategy', { student_id: aiStudent.id, date: aiDate });
      setAiResult(res.data.strategy);
    } catch (e) { toast.error('Gagal generate AI'); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER: Fix User digunakan disini */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-8 rounded-3xl shadow-lg">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Halo, {user?.nama}</h2>
        <p className="opacity-90 font-medium text-sm">Pusat kendali kokurikuler: Observasi, Misi Karakter, Monitoring, & AI Coach.</p>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {[
          { id: 'observasi', label: '1. Observasi Poin', icon: <PlusCircle size={16} /> },
          { id: 'materi', label: '2. Misi & Materi', icon: <BookOpen size={16} /> },
          { id: 'monitoring', label: '3. Monitor Kelas', icon: <Calendar size={16} /> },
          { id: 'ai', label: '4. AI Strategi', icon: <BrainCircuit size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-violet-50 text-violet-600 ring-1 ring-violet-200' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* === TAB 1: OBSERVASI === */}
      {activeTab === 'observasi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Cari Siswa</h3>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" placeholder="Ketik Nama atau NIS..." 
                  value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              {searchResults.length > 0 && searchQuery && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {searchResults.map((s) => (
                    <button key={s.id} onClick={() => { setSelectedStudent(s); setSearchResults([]); setSearchQuery(''); }} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-violet-50 hover:text-violet-700 font-bold text-xs transition-all flex justify-between items-center">
                      <span>{s.nama_lengkap}</span> <span className="text-[10px] bg-white px-2 py-1 rounded border">{s.kelas}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="bg-white p-6 rounded-3xl border border-violet-100 shadow-xl ring-2 ring-violet-500/10">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <p className="text-[10px] font-black uppercase text-slate-400">Input Poin Untuk</p>
                  <h3 className="text-lg font-black text-slate-800">{selectedStudent.nama_lengkap}</h3>
                  <p className="text-xs font-bold text-slate-500">{selectedStudent.kelas} • {selectedStudent.nomor_induk}</p>
                </div>
                <form onSubmit={submitObservasi} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {['prestasi', 'pelanggaran', 'ekstrakurikuler'].map(k => (
                      <button key={k} type="button" onClick={() => setFormObs({...formObs, kategori: k})} className={`p-2 rounded-lg text-[9px] font-black uppercase border ${formObs.kategori === k ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {k}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Judul Catatan..." required value={formObs.judul} onChange={e => setFormObs({...formObs, judul: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none" />
                  <textarea placeholder="Deskripsi..." value={formObs.deskripsi} onChange={e => setFormObs({...formObs, deskripsi: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none h-20" />
                  <input type="number" placeholder="Nilai Poin (Contoh: 10 atau 50)" required value={formObs.poin} onChange={e => setFormObs({...formObs, poin: parseInt(e.target.value)})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none" />
                  <button type="submit" className="w-full py-3 bg-slate-900 text-white font-black rounded-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">Simpan Catatan</button>
                </form>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2"><History size={16} /> Riwayat Input</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {history.length === 0 ? <p className="text-slate-400 text-xs text-center py-4">Belum ada riwayat.</p> : history.map((rec) => (
                <div key={rec.id} className="flex gap-3 items-start border-b border-slate-50 pb-3">
                  <div className={`mt-1 p-2 rounded-full ${rec.kategori === 'prestasi' ? 'bg-emerald-100 text-emerald-600' : rec.kategori === 'pelanggaran' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                    {rec.kategori === 'prestasi' ? <Trophy size={14} /> : rec.kategori === 'pelanggaran' ? <AlertTriangle size={14} /> : <Activity size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{rec.nama_siswa} <span className="text-slate-400">({rec.kelas})</span></p>
                    <p className="text-sm font-black text-slate-900">{rec.judul}</p>
                    <p className={`text-[10px] font-black uppercase ${rec.poin > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{rec.poin > 0 ? '+' : ''}{rec.poin} Poin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === TAB 2: MATERI & QUEST === */}
      {activeTab === 'materi' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4">
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><BookOpen size={24} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase">Buat Misi Karakter</h3>
                <p className="text-xs font-bold text-slate-400">Distribusikan tantangan kebiasaan ke kelas/siswa.</p>
              </div>
            </div>

            <form onSubmit={submitMateri} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sasaran</label>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setFormMat({...formMat, target_tipe: 'kelas'})} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase border ${formMat.target_tipe === 'kelas' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>Kelas</button>
                  <button type="button" onClick={() => setFormMat({...formMat, target_tipe: 'individu'})} className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase border ${formMat.target_tipe === 'individu' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400'}`}>Individu</button>
                </div>
              </div>

              {formMat.target_tipe === 'kelas' ? (
                <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Pilih Kelas</label>
                   <select value={formMat.target_id} onChange={e => setFormMat({...formMat, target_id: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none cursor-pointer">
                     {LIST_KELAS.map(k => <option key={k} value={k}>{k}</option>)}
                   </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">ID Siswa Target</label>
                  <input type="text" placeholder="Masukkan ID Siswa..." value={formMat.target_id} onChange={e => setFormMat({...formMat, target_id: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tanggal</label>
                  <input type="date" value={formMat.tanggal_tugas} onChange={e => setFormMat({...formMat, tanggal_tugas: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kebiasaan</label>
                  <select value={formMat.kategori_kebiasaan} onChange={e => setFormMat({...formMat, kategori_kebiasaan: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none">
                    {LIST_HABIT.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Judul Misi</label>
                <input type="text" placeholder="Contoh: Tantangan Sholat Dhuha" value={formMat.judul_materi} onChange={e => setFormMat({...formMat, judul_materi: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none" required />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Instruksi Detail</label>
                <textarea placeholder="Jelaskan langkah-langkah misi..." value={formMat.isi_materi} onChange={e => setFormMat({...formMat, isi_materi: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none h-32" required />
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase text-xs tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                <Send size={18} /> Kirim Misi
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
             <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Wall of Reflection</h3>
             <div className="bg-slate-50 rounded-xl p-6 text-center border-2 border-dashed border-slate-200">
               <Quote className="mx-auto text-slate-300 mb-2" size={32} />
               <p className="text-sm font-bold text-slate-600">Lihat Laporan Siswa</p>
               <p className="text-xs text-slate-400 mb-4">Pantau refleksi siswa yang telah mengerjakan misimu.</p>
               
               <div className="space-y-2 text-left">
                 {/* Ini adalah mockup akses ke laporan tugas. Nanti bisa diganti dengan list dinamis dari API */}
                 <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center group cursor-pointer hover:border-blue-300 transition-all" onClick={() => openTaskReport(1, 'Contoh Misi')}>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Contoh Misi</p>
                      <p className="text-[10px] text-slate-400">Klik untuk demo refleksi</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                 </div>
                 <p className="text-[10px] text-slate-400 text-center italic mt-2">*Daftar tugas akan muncul di sini</p>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL WALL OF REFLECTION */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col animate-in zoom-in-95">
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-800 uppercase text-lg">Wall of Reflection</h3>
                <p className="text-xs text-slate-500 font-bold">Misi: {selectedTaskTitle}</p>
              </div>
              <button onClick={() => setReportModalOpen(false)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
              {taskReport.length === 0 ? (
                <div className="col-span-2 text-center py-10">
                  <User size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 font-bold text-sm">Belum ada siswa yang menyelesaikan.</p>
                </div>
              ) : (
                taskReport.map((rep) => (
                  <div key={rep.id} className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8 opacity-50"></div>
                    
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
                        {rep.nama_lengkap.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase">{rep.nama_lengkap}</p>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                          <span>{rep.kelas}</span>
                          <span>•</span>
                          <span>{new Date(rep.tanggal_selesai).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative z-10 bg-amber-50/50 p-3 rounded-xl border border-amber-50">
                      <Quote size={16} className="text-amber-300 mb-1" />
                      <p className="text-xs text-slate-700 italic font-medium leading-relaxed line-clamp-4">"{rep.refleksi_siswa}"</p>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase">
                      <CheckCircle size={10} /> Misi Selesai
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* === TAB 3: MONITORING KELAS === */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-slate-400" />
              <select value={monKelas} onChange={e => setMonKelas(e.target.value)} className="bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold text-sm outline-none cursor-pointer hover:bg-slate-100">
                {LIST_KELAS.map(k => <option key={k} value={k}>Kelas {k}</option>)}
              </select>
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
                 <button onClick={() => setMonMonth(new Date(monMonth.getFullYear(), monMonth.getMonth()-1, 1))} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                 <span className="text-xs font-black uppercase px-2 w-24 text-center">{monMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                 <button onClick={() => setMonMonth(new Date(monMonth.getFullYear(), monMonth.getMonth()+1, 1))} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="flex gap-4 text-[10px] font-black uppercase">
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500"></div> Tinggi</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-400"></div> Sedang</span>
               <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500"></div> Rendah</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
               <div className="grid grid-cols-7 gap-2">
                  {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 mb-2">{d}</div>)}
                  {Array(new Date(monMonth.getFullYear(), monMonth.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                  {daysInMonth.map(date => {
                    const dateStr = date.toISOString().split('T')[0];
                    const status = monData?.dailyStats ? (monData.dailyStats[dateStr] || 'none') : 'none';
                    
                    let bgClass = 'bg-slate-50 text-slate-400';
                    if (status === 'high') bgClass = 'bg-emerald-500 text-white shadow-md shadow-emerald-200';
                    if (status === 'med') bgClass = 'bg-amber-400 text-white';
                    if (status === 'low') bgClass = 'bg-rose-500 text-white';

                    return (
                      <button 
                        key={dateStr} 
                        onClick={() => fetchDailyDetail(dateStr)}
                        className={`aspect-square rounded-xl flex items-center justify-center font-bold text-xs transition-all hover:scale-105 active:scale-95 ${bgClass}`}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
               </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[400px] flex flex-col">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 border-b border-slate-100 pb-2">
                Detail Aktivitas: {selectedDateDetail || '-'}
              </h3>
              <div className="overflow-y-auto flex-1 space-y-2 custom-scrollbar">
                {studentDetails.length === 0 ? (
                  <p className="text-center text-slate-300 text-xs py-10">Pilih tanggal untuk melihat detail.</p>
                ) : (
                  studentDetails.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                      <span className="text-xs font-bold text-slate-700">{s.nama_lengkap}</span>
                      {s.status_guru === 'approved' ? (
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-[9px] font-black uppercase">Sah Wali Kelas</span>
                      ) : s.status_ortu === 'approved' ? (
                        <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase">Valid Ortu</span>
                      ) : s.jurnal_id ? (
                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-[9px] font-black uppercase">Sudah Isi</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-[9px] font-black uppercase">Kosong</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TAB 4: AI COACH === */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-6">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Subjek Analisis</h3>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" placeholder="Cari Siswa..." 
                  onChange={(e) => handleSearch(e.target.value)} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto mb-4 custom-scrollbar">
                  {searchResults.map((s) => (
                    <button key={s.id} onClick={() => { setAiStudent(s); setSearchResults([]); }} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-violet-50 text-slate-700 font-bold text-xs transition-all flex justify-between items-center group">
                      {s.nama_lengkap} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              )}
              {aiStudent ? (
                <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 mb-6 animate-in zoom-in-95">
                  <p className="text-[10px] font-black uppercase text-violet-400 tracking-widest mb-1">Target</p>
                  <p className="font-black text-lg text-violet-900 leading-tight">{aiStudent.nama_lengkap}</p>
                  <p className="text-xs text-violet-600 mt-1">{aiStudent.kelas}</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 mb-6 text-center">
                  <p className="text-xs text-slate-400 font-medium">Belum ada siswa dipilih</p>
                </div>
              )}
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 block mb-2">Tanggal Data</label>
              <input type="date" value={aiDate} onChange={e => setAiDate(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none mb-6" />
              
              <button 
                onClick={generateStrategy} 
                disabled={aiLoading || !aiStudent}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-violet-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                {aiLoading ? <span className="animate-pulse">Berpikir...</span> : <><Sparkles size={18} /> Generate Strategi</>}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg min-h-[600px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -z-0 opacity-50 translate-x-1/3 -translate-y-1/3"></div>
              {aiResult ? (
                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                    <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl shadow-sm"><BrainCircuit size={32} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Strategi Pembelajaran</h3>
                      <p className="text-xs font-bold text-slate-400">AI Coach untuk {aiStudent?.nama_lengkap}</p>
                    </div>
                  </div>
                  <article className="prose prose-slate max-w-none">
                    <ReactMarkdown components={{
                      h3: ({node, ...props}) => <h3 className="text-lg font-black text-violet-700 mt-8 mb-4 flex items-center gap-2 uppercase tracking-wide bg-violet-50/50 p-2 rounded-lg w-fit" {...props} />,
                      p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-4 text-sm font-medium" {...props} />,
                      ul: ({node, ...props}) => <ul className="space-y-3 my-4" {...props} />,
                      li: ({node, ...props}) => <li className="flex items-start gap-3 text-slate-700 text-sm" {...props}><span className="mt-1.5 w-1.5 h-1.5 bg-violet-400 rounded-full shrink-0"></span><span>{props.children}</span></li>,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-fuchsia-400 pl-6 py-3 my-6 bg-fuchsia-50 rounded-r-xl text-fuchsia-900 italic font-medium shadow-sm" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-black text-slate-800" {...props} />,
                      hr: ({node, ...props}) => <hr className="border-slate-100 my-8" {...props} />
                    }}>
                      {aiResult}
                    </ReactMarkdown>
                  </article>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center z-10 relative">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse"><BrainCircuit size={48} className="text-slate-300" /></div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">AI Coach Siap Membantu</h3>
                  <p className="text-sm text-slate-500 max-w-md leading-relaxed">Pilih siswa dan tanggal di panel kiri untuk mendapatkan analisis psikologis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};