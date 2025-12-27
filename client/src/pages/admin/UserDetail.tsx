import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, Trash2, AlertTriangle, Shield, User } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const UserDetail: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk aksi
  const [activeAction, setActiveAction] = useState<'details' | 'reset' | 'delete'>('details');
  const [newPassword, setNewPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchUserDetail();
  }, [userId]);

  const fetchUserDetail = async () => {
    try {
      // Kita asumsikan ada endpoint ini, atau bisa filter dari list jika API get-by-id belum ada
      // Jika backend belum support get by ID, kita pakai logic get all lalu find (opsional)
      // Disini saya gunakan asumsi best practice endpoint /admin/users/:id
      const res = await api.get(`/admin/users/${userId}`);
      setUser(res.data);
    } catch (e) {
      toast.error('Gagal memuat data user');
      navigate('/admin-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
      toast.success('Password berhasil direset');
      setActiveAction('details');
      setNewPassword('');
    } catch (e) {
      toast.error('Gagal reset password');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    setProcessing(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User berhasil dihapus');
      navigate('/admin-dashboard'); // Kembali ke dashboard setelah hapus
    } catch (e) {
      toast.error('Gagal menghapus user');
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 font-bold">Memuat detail user...</div>;
  if (!user) return <div className="p-8 text-center text-slate-400 font-bold">User tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Detail Pengguna</h1>
          <p className="text-slate-500 text-sm font-bold">Manajemen data dan akses akun</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Profil Utama */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <User size={48} />
            </div>
            <h2 className="text-lg font-black text-slate-800 mb-1">{user.nama_lengkap}</h2>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-wide">
              {user.peran.replace('_', ' ')}
            </span>
            <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-2 text-left">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">Nomor Induk</p>
                <p className="font-bold text-slate-700">{user.nomor_induk}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">ID Sistem</p>
                <p className="font-bold text-slate-700 truncate" title={user.id}>#{user.id.toString().slice(-4)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
              <Shield className="text-indigo-500" />
              <h3 className="font-black text-slate-700">Pusat Kontrol Akun</h3>
            </div>

            {/* Menu Default */}
            {activeAction === 'details' && (
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveAction('reset')}
                  className="w-full p-6 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl font-bold text-left hover:bg-amber-100 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500"><KeyRound size={20} /></div>
                    <div>
                      <h4 className="font-black">Reset Password</h4>
                      <p className="text-xs opacity-70 font-normal mt-1">Ubah kata sandi pengguna ini jika lupa.</p>
                    </div>
                  </div>
                  <span className="text-xs uppercase font-black bg-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">Akses</span>
                </button>

                {user.peran !== 'admin' && (
                  <button 
                    onClick={() => setActiveAction('delete')}
                    className="w-full p-6 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl font-bold text-left hover:bg-rose-100 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-rose-500"><Trash2 size={20} /></div>
                      <div>
                        <h4 className="font-black">Hapus Pengguna</h4>
                        <p className="text-xs opacity-70 font-normal mt-1">Tindakan ini permanen dan tidak bisa dibatalkan.</p>
                      </div>
                    </div>
                    <span className="text-xs uppercase font-black bg-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">Bahaya</span>
                  </button>
                )}
              </div>
            )}

            {/* Form Reset Password */}
            {activeAction === 'reset' && (
              <form onSubmit={handleReset} className="animate-in slide-in-from-right-4">
                <h4 className="font-bold text-slate-800 mb-2">Reset Password Baru</h4>
                <p className="text-sm text-slate-500 mb-4">Masukkan password baru yang aman untuk pengguna ini.</p>
                <input 
                  type="text" 
                  placeholder="Password Baru..." 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-200 mb-6"
                  autoFocus
                  required
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setActiveAction('details')} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm uppercase hover:bg-slate-200">Batal</button>
                  <button type="submit" disabled={processing} className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl text-sm uppercase shadow-lg hover:bg-amber-600 hover:shadow-amber-200">
                    {processing ? 'Menyimpan...' : 'Simpan Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Konfirmasi Hapus */}
            {activeAction === 'delete' && (
              <div className="text-center py-8 animate-in slide-in-from-right-4">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
                <h4 className="text-xl font-black text-slate-800 mb-2">Hapus Pengguna Permanen?</h4>
                <p className="text-slate-500 max-w-xs mx-auto mb-8">Data yang dihapus akan hilang selamanya dari database dan tidak dapat dikembalikan.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setActiveAction('details')} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm uppercase hover:bg-slate-200">Batal</button>
                  <button onClick={handleDelete} disabled={processing} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl text-sm uppercase shadow-lg hover:bg-rose-700 hover:shadow-rose-200">
                    {processing ? 'Menghapus...' : 'Ya, Hapus Sekarang'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};