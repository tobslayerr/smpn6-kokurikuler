import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  UploadCloud, Save, ChevronRight, Sun, Moon, Heart, Activity, 
  BookOpen, Target, CheckCircle, Flame, ArrowRight, Star, Shield, Zap
} from 'lucide-react';

// --- DATA STATIS ---
const LIST_IBADAH = ["Shubuh", "Dzuhur", "Ashar", "Maghrib", "Isya", "Dhuha", "Tahajjud", "Baca Al-Qur'an", "Shalat Berjamaah"];
const LIST_OLAHRAGA = ["Jogging", "Jalan Santai", "Bersepeda", "Berenang", "Sepak Bola", "Bola Basket", "Bulu Tangkis", "Tenis Meja", "Gym / Fitnes", "Yoga", "Plank", "Push-up / Sit-up", "Senam / Aerobik", "Lompat Tali", "Karate / Silat", "Taekwondo", "Futsal", "Voli", "Panahan", "Catur"];
const LIST_MAPEL = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS", "Informatika", "Seni Budaya", "PJOK", "PKn", "PAI / Agama", "Bhs. Daerah", "Fisika", "Kimia", "Biologi", "Ekonomi", "Geografi", "Sosiologi", "Sejarah"];
const LIST_EKSKUL = ["Pramuka", "PMR", "Paskibra", "Coding / Robotik", "Musik / Band", "Tari Tradisional", "Melukis", "Jurnalistik", "Paduan Suara", "English Club"];
const LIST_SOSIAL = ["Kerja Bakti", "Gotong Royong", "Menolong Sesama", "Bakti Sosial", "Kegiatan RT/RW", "Organisasi (OSIS/Pramuka)", "Menjaga Kebersihan Umum", "Menyantuni Anak Yatim", "Menghargai Perbedaan", "Diskusi Warga"];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // State Jurnal
  const [activeTab, setActiveTab] = useState<'rencana' | 'realisasi'>('rencana');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  // State Gamifikasi & Misi
  const [userXP, setUserXP] = useState(0);
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [reflection, setReflection] = useState('');

  // State Form Jurnal
  const [form, setForm] = useState<any>({
    jam_bangun: '', jam_tidur: '', ibadah_list: [], ibadah_catatan: '',
    olahraga_jenis: '', olahraga_detail: '', makan_sehat: '',
    belajar_mapel: '', belajar_ekskul: '', sosial_aksi: '',
  });

  // --- FETCH DATA ---
  useEffect(() => {
    fetchMissions();
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await api.get('/auth/me'); 
      // Pastikan backend /auth/me mengembalikan kolom xp
      setUserXP(res.data.xp || 0); 
    } catch (e) { console.error('Gagal load stats'); }
  };

  const fetchMissions = async () => {
    try {
      const res = await api.get('/student/missions');
      setMissions(res.data);
    } catch (error) { console.error('Gagal ambil misi'); }
  };

  // --- LOGIC GAMIFIKASI ---
  const currentLevel = Math.floor(userXP / 500) + 1;
  const xpForNextLevel = 500;
  const currentLevelXP = userXP % 500;
  const progressPercent = (currentLevelXP / xpForNextLevel) * 100;

  // Tentukan Title Berdasarkan Level
  let playerTitle = "Novice";
  if (currentLevel >= 5) playerTitle = "Apprentice";
  if (currentLevel >= 10) playerTitle = "Warrior";
  if (currentLevel >= 20) playerTitle = "Champion";
  if (currentLevel >= 50) playerTitle = "Legend";

  // --- HANDLERS ---
  const handleCompleteMission = async () => {
    if (!selectedMission) return;
    try {
      await api.post('/student/missions/complete', {
        id_tugas: selectedMission.id,
        refleksi: reflection
      });
      
      toast.success(`Misi Selesai! +50 XP`, { icon: '🎉' });
      
      setSelectedMission(null);
      setReflection('');
      
      // Refresh Data
      fetchMissions();
      fetchUserStats();
    } catch (error) {
      toast.error('Gagal menyelesaikan misi');
    }
  };

  const handleCheck = (item: string, field: string) => {
    const list = form[field] || [];
    if (list.includes(item)) {
      setForm({ ...form, [field]: list.filter((i: string) => i !== item) });
    } else {
      setForm({ ...form, [field]: [...list, item] });
    }
  };

  const handleSubmitJournal = async () => {
    if (!photo) return toast.error('Wajib upload bukti foto kegiatan!');
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('tanggal', date);
    formData.append('data_kebiasaan', JSON.stringify(form));
    formData.append('bukti_foto', photo);

    try {
      await api.post('/journals', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Jurnal berhasil disimpan!');
      setForm({
        jam_bangun: '', jam_tidur: '', ibadah_list: [], ibadah_catatan: '',
        olahraga_jenis: '', olahraga_detail: '', makan_sehat: '',
        belajar_mapel: '', belajar_ekskul: '', sosial_aksi: '',
      });
      setPhoto(null);
    } catch (error: any) { 
      toast.error(error.response?.data?.message || 'Gagal menyimpan jurnal'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* 1. GAMIFICATION HEADER CARD */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Level Circle */}
          <div className="relative shrink-0">
             <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center bg-slate-800 shadow-[0_0_20px_rgba(59,130,246,0.6)]">
               <div className="text-center">
                 <p className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Level</p>
                 <p className="text-4xl font-black leading-none">{currentLevel}</p>
               </div>
             </div>
             <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-slate-900 uppercase tracking-widest whitespace-nowrap">
               {playerTitle}
             </div>
          </div>

          {/* XP Bar & Info */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{user?.nama}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mt-1">
                  <Shield size={14} className="text-blue-400" />
                  <span>Kelas {user?.kelas}</span>
                  <span>•</span>
                  <span>NIS: {user?.nomor_induk}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-amber-400">
                   <Zap size={16} fill="currentColor" />
                   <p className="text-2xl font-black">{userXP}</p>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Experience</p>
              </div>
            </div>
            
            {/* Progress Bar Container */}
            <div className="w-full bg-slate-800 rounded-full h-4 border border-slate-700 relative overflow-hidden shadow-inner">
               <div 
                 className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                 style={{ width: `${progressPercent}%` }}
               >
                 <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
               </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <span>{currentLevelXP} XP Current</span>
              <span>Target: {xpForNextLevel} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MISI & TANTANGAN SECTION */}
      {missions.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Flame className="text-orange-500 fill-orange-500" size={20} />
            <h3 className="text-sm font-black uppercase text-slate-700 tracking-widest">Misi & Tantangan Aktif</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((mission) => (
              <div key={mission.id} className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all border-b-4 border-b-orange-100 hover:border-b-orange-400 hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity rotate-12">
                  <Target size={80} className="text-orange-500" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border border-orange-100">
                      {mission.kategori_kebiasaan}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Star size={10} className="text-amber-400 fill-amber-400" /> +50 XP
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-black text-slate-800 mb-1 leading-tight">{mission.judul_materi}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium">{mission.isi_materi}</p>
                  
                  <button 
                    onClick={() => setSelectedMission(mission)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                  >
                    Buka Misi <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MODAL PENYELESAIAN MISI */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Misi Harian</p>
                  <h3 className="text-xl font-black leading-tight">{selectedMission.judul_materi}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Target size={24} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
                <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                  {selectedMission.isi_materi}
                </p>
              </div>

              <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Refleksi / Catatanmu</label>
              <textarea 
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Bagaimana perasaanmu setelah melakukan ini? Apa yang kamu pelajari?"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium h-32 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all mb-6"
              />

              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => setSelectedMission(null)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl text-xs uppercase hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleCompleteMission}
                  disabled={!reflection}
                  className="flex-[2] py-3 bg-orange-500 text-white font-black rounded-xl text-xs uppercase shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle size={18} /> Klaim Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FORM JURNAL HARIAN */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between items-end px-1">
          <div>
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Jurnal Harian</h3>
             <p className="text-xs font-bold text-slate-400">Catat rutinitasmu hari ini.</p>
          </div>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="bg-slate-100 text-slate-700 p-2 rounded-xl font-bold text-xs outline-none border border-slate-200" 
          />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">
          {/* Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200 shadow-inner mb-6">
            <button onClick={() => setActiveTab('rencana')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'rencana' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>1. Rencana</button>
            <button onClick={() => setActiveTab('realisasi')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'realisasi' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>2. Realisasi</button>
          </div>

          {activeTab === 'rencana' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-white rounded-lg text-amber-500 shadow-sm"><Sun size={18} /></div>
                    <h3 className="font-black text-slate-800 uppercase text-sm">Bangun Pagi</h3>
                  </div>
                  <input type="time" value={form.jam_bangun} onChange={e => setForm({...form, jam_bangun: e.target.value})} className="w-full p-3 bg-white border border-amber-200 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-amber-200" />
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-white rounded-lg text-indigo-500 shadow-sm"><Moon size={18} /></div>
                    <h3 className="font-black text-slate-800 uppercase text-sm">Tidur Cepat</h3>
                  </div>
                  <input type="time" value={form.jam_tidur} onChange={e => setForm({...form, jam_tidur: e.target.value})} className="w-full p-3 bg-white border border-indigo-200 rounded-xl font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setActiveTab('realisasi')} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase hover:bg-slate-800 transition-all shadow-lg">Lanjut Pengisian <ChevronRight size={16} /></button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Form Groups */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500 border border-emerald-100"><Heart size={18} /></div>
                  <h3 className="font-black text-slate-800 uppercase text-sm">Beribadah (Islam)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {LIST_IBADAH.map(item => (
                    <label key={item} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${form.ibadah_list?.includes(item) ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                      <input type="checkbox" checked={form.ibadah_list?.includes(item)} onChange={() => handleCheck(item, 'ibadah_list')} className="accent-emerald-600 w-4 h-4" />
                      <span className="text-xs font-bold text-slate-700">{item}</span>
                    </label>
                  ))}
                </div>
                <input type="text" placeholder="Catatan tambahan ibadah..." value={form.ibadah_catatan} onChange={e => setForm({...form, ibadah_catatan: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-400" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500 border border-blue-100"><Activity size={18} /></div>
                  <h3 className="font-black text-slate-800 uppercase text-sm">Berolahraga</h3>
                </div>
                <select value={form.olahraga_jenis} onChange={e => setForm({...form, olahraga_jenis: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-400">
                  <option value="">-- Pilih Aktivitas Olahraga --</option>
                  {LIST_OLAHRAGA.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <input type="text" placeholder="Detail (Durasi/Jarak)" value={form.olahraga_detail} onChange={e => setForm({...form, olahraga_detail: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-rose-50 rounded-lg text-rose-500 border border-rose-100"><Heart size={18} /></div>
                      <h3 className="font-black text-slate-800 uppercase text-sm">Makan Sehat</h3>
                    </div>
                    <textarea placeholder="Menu makanan hari ini..." value={form.makan_sehat} onChange={e => setForm({...form, makan_sehat: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium h-24 outline-none focus:border-rose-400" />
                </div>
                
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                      <div className="p-2 bg-violet-50 rounded-lg text-violet-500 border border-violet-100"><BookOpen size={18} /></div>
                      <h3 className="font-black text-slate-800 uppercase text-sm">Gemar Belajar</h3>
                    </div>
                    <select value={form.belajar_mapel} onChange={e => setForm({...form, belajar_mapel: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none mb-2">
                      <option value="">-- Pilih Mapel --</option>
                      {LIST_MAPEL.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <select value={form.belajar_ekskul} onChange={e => setForm({...form, belajar_ekskul: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none">
                      <option value="">-- Pilih Ekskul --</option>
                      {LIST_EKSKUL.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-50 rounded-lg text-cyan-500 border border-cyan-100"><Activity size={18} /></div>
                  <h3 className="font-black text-slate-800 uppercase text-sm">Bermasyarakat</h3>
                </div>
                <select value={form.sosial_aksi} onChange={e => setForm({...form, sosial_aksi: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-cyan-400">
                  <option value="">-- Pilih Aksi Sosial --</option>
                  {LIST_SOSIAL.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="pt-6 border-t border-slate-100">
                 <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-300 text-center hover:bg-slate-100 transition-colors group">
                  <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)} />
                  <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest">{photo ? `File Terpilih: ${photo.name}` : 'Upload Bukti Foto Kegiatan'}</span>
                  </label>
                </div>
              </div>

              <button onClick={handleSubmitJournal} disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white font-black rounded-xl uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? 'Menyimpan...' : <><Save size={18} /> Simpan Jurnal</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};