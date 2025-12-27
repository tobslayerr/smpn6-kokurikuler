import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase, GraduationCap, HeartHandshake, BookOpen, Users } from 'lucide-react';

export const Register: React.FC = () => {
  const [category, setCategory] = useState<'siswa' | 'guru' | 'orang_tua'>('siswa');
  const [teacherType, setTeacherType] = useState<'wali_kelas' | 'kontributor'>('wali_kelas');

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nomor_induk: '',
    kata_sandi: '',
    kelas: '7A',
    no_hp: '' // State untuk menyimpan No HP
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let finalRole = category === 'siswa' ? 'siswa' : category === 'orang_tua' ? 'orang_tua' : teacherType;

    const payload = { ...formData, peran: finalRole };
    
    // Hapus properti kelas jika bukan siswa/wali kelas
    if (finalRole === 'kontributor' || finalRole === 'orang_tua') {
      delete (payload as any).kelas;
    }

    try {
      await api.post('/auth/register', payload);
      toast.success('Pendaftaran berhasil! Silakan login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mendaftar. Cek data kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        
        <div className="text-center mb-6">
          <img src="/logosmpn6pekalongan.png" alt="Logo" className="h-16 w-auto mx-auto mb-3 object-contain" />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Buat Akun Baru</h2>
          <p className="text-xs text-slate-500 font-bold">Pilih peran Anda di sekolah</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-100 p-1 rounded-xl">
          <button 
            type="button" 
            onClick={() => setCategory('siswa')} 
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-black uppercase transition-all ${category === 'siswa' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400'}`}
          >
            <GraduationCap size={18} className="mb-1"/> Siswa
          </button>
          
          <button 
            type="button" 
            onClick={() => setCategory('guru')} 
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-black uppercase transition-all ${category === 'guru' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400'}`}
          >
            <Briefcase size={18} className="mb-1"/> Guru
          </button>
          
          <button 
            type="button" 
            onClick={() => setCategory('orang_tua')} 
            className={`flex flex-col items-center justify-center py-2 rounded-lg text-[10px] font-black uppercase transition-all ${category === 'orang_tua' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400'}`}
          >
            <HeartHandshake size={18} className="mb-1"/> Ortu
          </button>
        </div>

        {category === 'guru' && (
          <div className="flex gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <button
              type="button"
              onClick={() => setTeacherType('wali_kelas')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${teacherType === 'wali_kelas' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-400'}`}
            >
              <Users size={14} /> Wali Kelas
            </button>
            <button
              type="button"
              onClick={() => setTeacherType('kontributor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${teacherType === 'kontributor' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-400'}`}
            >
              <BookOpen size={14} /> Mapel / Ekskul
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder={category === 'siswa' ? "Contoh: Budi Santoso" : "Contoh: Bpk. Ahmad S.Pd"} 
              required
              className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
              onChange={e => setFormData({...formData, nama_lengkap: e.target.value})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              {category === 'siswa' ? 'NISN (Nomor Induk Siswa)' : category === 'guru' ? 'NIP (Nomor Induk Pegawai)' : 'Nomor HP (ID Login)'}
            </label>
            <input 
              type="text" 
              placeholder={category === 'orang_tua' ? "08xxxxxxxx" : "Nomor Induk..."} 
              required
              className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
              onChange={e => setFormData({...formData, nomor_induk: e.target.value})}
            />
          </div>

          {/* INPUT NO HP (Muncul untuk SISWA dan ORANG TUA) */}
          {(category === 'siswa' || category === 'orang_tua') && (
             <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  {category === 'siswa' ? 'Nomor WhatsApp Siswa (Aktif)' : 'Nomor WhatsApp Orang Tua'}
                </label>
                <input 
                  type="text" 
                  placeholder="08xxxxxxxx" 
                  required={category === 'orang_tua'} // Wajib bagi ortu, opsional bagi siswa (tapi disarankan)
                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm" 
                  onChange={e => setFormData({...formData, no_hp: e.target.value})} 
                />
                {category === 'siswa' && <p className="text-[9px] text-slate-400 mt-1 italic">*Diperlukan untuk fitur pengingat jurnal dari Orang Tua.</p>}
             </div>
          )}

          {(category === 'siswa' || (category === 'guru' && teacherType === 'wali_kelas')) && (
            <div>
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                 {category === 'siswa' ? 'Kelas' : 'Wali Kelas Dari'}
               </label>
               <select 
                className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-blue-500 cursor-pointer"
                onChange={e => setFormData({...formData, kelas: e.target.value})}
                value={formData.kelas}
              >
                <optgroup label="Kelas 7">
                  <option value="7A">Kelas 7A</option>
                  <option value="7B">Kelas 7B</option>
                  <option value="7C">Kelas 7C</option>
                </optgroup>
                <optgroup label="Kelas 8">
                  <option value="8A">Kelas 8A</option>
                  <option value="8B">Kelas 8B</option>
                  <option value="8C">Kelas 8C</option>
                </optgroup>
                <optgroup label="Kelas 9">
                  <option value="9A">Kelas 9A</option>
                  <option value="9B">Kelas 9B</option>
                  <option value="9C">Kelas 9C</option>
                </optgroup>
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kata Sandi</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition-all"
              onChange={e => setFormData({...formData, kata_sandi: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-4 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-lg transition-all disabled:opacity-50 mt-2 ${
              category === 'siswa' ? 'bg-blue-600 hover:bg-blue-700' : 
              category === 'guru' ? 'bg-indigo-600 hover:bg-indigo-700' : 
              'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isLoading ? 'Memproses...' : `Daftar`}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Sudah punya akun? <span className="text-blue-600">Login disini</span>
          </Link>
        </div>
      </div>
    </div>
  );
};