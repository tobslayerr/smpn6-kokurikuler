import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  UserPlus, MessageCircle, CheckCircle, XCircle, ChevronRight, 
  ArrowLeft, Award, AlertTriangle, TrendingUp, Activity, Clock, 
  X, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CalendarView } from '../../components/features/CalendarView';

interface ChildData {
  profile: any;
  journals: any[];
  records: any[];
  stats: {
    total_jurnal: number;
    poin_positif: number;
    poin_negatif: number;
  };
}

export const ParentDashboard: React.FC = () => {
  useAuth();
  
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nisInput, setNisInput] = useState('');

  const [selectedChildData, setSelectedChildData] = useState<ChildData | null>(null);
  const [activeTab, setActiveTab] = useState<'jurnal' | 'catatan'>('jurnal');

  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [journalToValidate, setJournalToValidate] = useState<any>(null);
  const [validationNote, setValidationNote] = useState('');

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parent/children');
      setChildren(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/parent/link', { nis_siswa: nisInput });
      toast.success('Anak berhasil dihubungkan!');
      setNisInput('');
      fetchChildren();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghubungkan');
    }
  };

  const handleRemind = async (e: React.MouseEvent, studentId: number) => {
    e.stopPropagation();
    try {
      await api.post('/parent/remind', { student_id: studentId });
      toast.success('Pengingat WhatsApp terkirim!');
    } catch (error) {
      toast.error('Gagal mengirim pesan');
    }
  };

  const openChildDetail = async (studentId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/parent/child/${studentId}`);
      setSelectedChildData(res.data);
      setViewMode('detail');
      setActiveTab('jurnal');
    } catch (error) {
      toast.error('Gagal memuat detail anak');
    } finally {
      setLoading(false);
    }
  };

  const openValidationModal = (e: React.MouseEvent, child: any) => {
    e.stopPropagation();
    if (!child.journal_id) return;
    
    setJournalToValidate({
      id: child.journal_id,
      nama: child.nama_lengkap,
      data: child.data_kebiasaan ? JSON.parse(child.data_kebiasaan) : null,
      foto: child.bukti_foto
    });
    setValidationNote('');
    setValidationModalOpen(true);
  };

  const submitValidation = async (status: 'approved' | 'rejected') => {
    if (!journalToValidate) return;
    try {
      await api.post('/journals/validate', {
        id_jurnal: journalToValidate.id,
        status: status,
        catatan: validationNote || (status === 'approved' ? 'Disetujui Orang Tua' : 'Perlu diperbaiki'),
        tipe_validator: 'parent'
      });
      toast.success(status === 'approved' ? 'Jurnal disetujui' : 'Jurnal dikembalikan');
      setValidationModalOpen(false);
      fetchChildren(); 
    } catch (error) {
      toast.error('Gagal memproses validasi');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const renderDetailRow = (label: string, value: string, sub?: string) => (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value || '-'}</p>
      {sub && <p className="text-xs text-slate-500 mt-1 italic">"{sub}"</p>}
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="space-y-8 pb-24">
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Portal Orang Tua</h2>
            <p className="opacity-90 font-medium text-sm">Pantau aktivitas dan perkembangan karakter putra-putri Anda.</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-32 bg-white/10 transform skew-x-12"></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Hubungkan Anak</h3>
          <form onSubmit={handleLinkChild} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Masukkan NISN Anak..." 
              value={nisInput}
              onChange={e => setNisInput(e.target.value)}
              className="flex-1 p-3 bg-slate-50 border rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-rose-200"
              required
            />
            <button type="submit" className="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2">
              <UserPlus size={18} /> <span className="hidden sm:inline">Tambah</span>
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Daftar Anak</h3>
          {loading && children.length === 0 ? (
             <div className="text-center py-10 text-slate-400">Memuat data...</div>
          ) : children.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 text-xs font-bold">Belum ada anak terhubung.</p>
            </div>
          ) : (
            children.map((child) => (
              <div 
                key={child.id}
                onClick={() => openChildDetail(child.id)}
                className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-slate-50 p-2 rounded-full text-slate-400"><ChevronRight /></div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg ${child.journal_id ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-slate-300 to-slate-400'}`}>
                    {child.nama_lengkap.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 group-hover:text-rose-600 transition-colors">{child.nama_lengkap}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase">{child.kelas} • NIS: {child.nomor_induk}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {child.journal_id ? (
                    child.status_ortu === 'approved' ? (
                      <div className="flex-1 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
                        <CheckCircle size={20} />
                        <div>
                          <p className="text-[9px] font-black uppercase opacity-60">Status Hari Ini</p>
                          <p className="text-xs font-bold">Sudah Divalidasi</p>
                        </div>
                      </div>
                    ) : child.status_ortu === 'rejected' ? (
                      <div className="flex-1 p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700">
                        <XCircle size={20} />
                        <div>
                          <p className="text-[9px] font-black uppercase opacity-60">Status Hari Ini</p>
                          <p className="text-xs font-bold">Perlu Revisi</p>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => openValidationModal(e, child)}
                        className="flex-1 p-3 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                      >
                        <Clock size={18} />
                        <span className="text-xs font-black uppercase">Periksa Jurnal</span>
                      </button>
                    )
                  ) : (
                    <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-slate-500">
                      <Clock size={20} />
                      <div>
                        <p className="text-[9px] font-black uppercase opacity-60">Status Hari Ini</p>
                        <p className="text-xs font-bold">Belum Mengisi</p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={(e) => handleRemind(e, child.id)}
                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 rounded-2xl transition-all"
                    title="Ingatkan via WhatsApp"
                  >
                    <MessageCircle size={24} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* VALIDATION MODAL (POPUP) */}
        {validationModalOpen && journalToValidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
              <div className="bg-slate-50 p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-800 uppercase text-lg">Validasi Jurnal</h3>
                  <p className="text-xs text-slate-500 font-bold">{journalToValidate.nama}</p>
                </div>
                <button onClick={() => setValidationModalOpen(false)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {journalToValidate.data ? (
                  <>
                    {renderDetailRow("Bangun Pagi", journalToValidate.data.jam_bangun)}
                    {renderDetailRow("Tidur Malam", journalToValidate.data.jam_tidur)}
                    {renderDetailRow("Ibadah", journalToValidate.data.ibadah_list?.join(', '), journalToValidate.data.ibadah_catatan)}
                    {renderDetailRow("Olahraga", journalToValidate.data.olahraga_jenis, journalToValidate.data.olahraga_detail)}
                    {renderDetailRow("Makan Sehat", journalToValidate.data.makan_sehat)}
                    {renderDetailRow("Belajar", journalToValidate.data.belajar_mapel, journalToValidate.data.belajar_ekskul)}
                    {renderDetailRow("Sosial", journalToValidate.data.sosial_aksi)}

                    {journalToValidate.foto && (
                      <div className="mt-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Bukti Foto</p>
                        <img src={`http://localhost:5000/uploads/${journalToValidate.foto}`} className="w-full rounded-xl border border-slate-200" alt="Bukti" />
                      </div>
                    )}
                  </>
                ) : (
                   <p className="text-center text-slate-400">Data tidak terbaca.</p>
                )}

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <label className="text-xs font-black uppercase text-slate-500 mb-2 block">Catatan Orang Tua</label>
                  <textarea 
                    value={validationNote}
                    onChange={(e) => setValidationNote(e.target.value)}
                    placeholder="Tulis pesan semangat atau koreksi..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium h-24 outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex gap-3 bg-slate-50">
                <button onClick={() => submitValidation('rejected')} className="flex-1 py-3 bg-white border-2 border-rose-100 text-rose-600 font-black rounded-xl uppercase text-xs tracking-widest hover:bg-rose-50 transition-colors">
                  Kembalikan
                </button>
                <button onClick={() => submitValidation('approved')} className="flex-[2] py-3 bg-emerald-500 text-white font-black rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                  <Check size={18} /> Setujui
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // === DETAIL VIEW (SUPER APP) ===
  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-4 sticky top-0 bg-slate-50/90 backdrop-blur-sm z-30 py-2">
        <button onClick={() => setViewMode('list')} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase leading-none">{selectedChildData?.profile.nama_lengkap}</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">Detail Perkembangan Siswa</p>
        </div>
      </div>

      {selectedChildData && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <TrendingUp className="text-blue-500 mb-2" size={20} />
            <p className="text-2xl font-black text-slate-800">{selectedChildData.stats.total_jurnal}</p>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Jurnal</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <Award className="text-emerald-500 mb-2" size={20} />
            <p className="text-2xl font-black text-slate-800">{selectedChildData.stats.poin_positif}</p>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Poin Prestasi</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <AlertTriangle className="text-rose-500 mb-2" size={20} />
            <p className="text-2xl font-black text-slate-800">{selectedChildData.stats.poin_negatif}</p>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Poin Pelanggaran</p>
          </div>
        </div>
      )}

      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
        <button 
          onClick={() => setActiveTab('jurnal')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'jurnal' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Riwayat Jurnal
        </button>
        <button 
          onClick={() => setActiveTab('catatan')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'catatan' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Catatan Sekolah
        </button>
      </div>

      {activeTab === 'jurnal' && selectedChildData && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <CalendarView 
            entries={selectedChildData.journals} 
            selectedDate={new Date().toISOString().split('T')[0]} 
            onDateSelect={() => {}} 
          />
          <div className="mt-6 space-y-4">
             <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Aktivitas Terakhir</h3>
             {selectedChildData.journals.slice(0, 5).map((j: any) => (
               <div key={j.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${j.status_ortu === 'approved' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{formatDate(j.tanggal)}</p>
                      <p className="text-[10px] text-slate-400 uppercase">{j.status_ortu === 'approved' ? 'Tervalidasi' : 'Belum/Revisi'}</p>
                    </div>
                  </div>
                  {j.status_guru === 'approved' && <Award size={16} className="text-blue-500" />}
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'catatan' && selectedChildData && (
        <div className="space-y-4">
          {selectedChildData.records.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm text-center">
              <Award className="mx-auto text-slate-200 mb-3" size={48} />
              <p className="text-slate-400 text-xs font-bold">Belum ada catatan sekolah.</p>
            </div>
          ) : (
            selectedChildData.records.map((rec: any) => (
              <div key={rec.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
                <div className={`mt-1 p-3 rounded-2xl ${rec.kategori === 'prestasi' ? 'bg-emerald-100 text-emerald-600' : rec.kategori === 'pelanggaran' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                  {rec.kategori === 'prestasi' ? <Award size={20} /> : rec.kategori === 'pelanggaran' ? <AlertTriangle size={20} /> : <Activity size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${rec.kategori === 'prestasi' ? 'bg-emerald-50 text-emerald-700' : rec.kategori === 'pelanggaran' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
                      {rec.kategori}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">• {formatDate(rec.dibuat_pada)}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 leading-tight">{rec.judul}</h4>
                  <p className="text-xs text-slate-500 mt-1">{rec.deskripsi || 'Tidak ada deskripsi'}</p>
                  
                  <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2">
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Oleh: {rec.nama_pencatat}</p>
                     <p className={`text-xs font-black ${rec.poin > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {rec.poin > 0 ? '+' : ''}{rec.poin} Poin
                     </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};