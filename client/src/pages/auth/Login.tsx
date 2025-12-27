import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // Bisa NIS, NIP, atau No HP
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Mengirim 'nomor_induk' ke backend (Backend akan mencocokkan dengan NIS/NIP/NoHP)
      const res = await api.post('/auth/login', { nomor_induk: identifier, kata_sandi: password });
      
      login(res.data.token, res.data.user);
      toast.success(`Selamat datang, ${res.data.user.nama}!`);
      
      // Redirect akan ditangani oleh App.tsx di route '/'
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal login. Periksa data Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        
        {/* LOGO SECTION */}
        <div className="text-center mb-8">
          <img 
            src="/logosmpn6pekalongan.png" 
            alt="Logo SMPN 6" 
            className="h-20 w-auto mx-auto mb-4 object-contain drop-shadow-sm" 
          />
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">ISOKURIKULER</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">SMPN 6 Pekalongan</p>
        </div>

        {/* FORM LOGIN */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              ID Pengguna
            </label>
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all placeholder:font-normal placeholder:text-slate-300"
              placeholder="NIS / NIP / No. HP"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Kata Sandi
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all placeholder:font-normal placeholder:text-slate-300"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-lg hover:bg-slate-800 transition-all uppercase text-xs tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses Masuk...' : 'Masuk Aplikasi'}
          </button>
        </form>

        {/* FOOTER LINK */}
        <div className="mt-8 text-center pt-6 border-t border-slate-50">
          <p className="text-xs text-slate-500">
            Belum punya akun? <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};