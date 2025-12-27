import React, { useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, Send } from 'lucide-react';

export const BroadcastTab: React.FC = () => {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('orang_tua');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  const openBroadcastModal = () => { if (!broadcastMsg.trim()) return toast.error('Isi pesan dulu'); setBroadcastModalOpen(true); };

  const confirmBroadcast = async () => {
    setBroadcastLoading(true);
    try {
      const res = await api.post('/admin/broadcast', { target_role: broadcastTarget, message: broadcastMsg });
      toast.success(res.data.message); setBroadcastMsg(''); setBroadcastModalOpen(false);
    } catch (e) { toast.error('Gagal broadcast'); } finally { setBroadcastLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 block">Target Penerima</label>
            <div className="space-y-3">
              {['orang_tua', 'siswa', 'wali_kelas', 'all'].map(role => (
                <button 
                  key={role} 
                  onClick={() => setBroadcastTarget(role)}
                  className={`w-full p-4 rounded-2xl text-left font-bold text-xs uppercase border-2 transition-all flex items-center justify-between ${
                    broadcastTarget === role 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {role === 'all' ? 'Semua User' : role.replace('_', ' ')}
                  {broadcastTarget === role && <CheckCircle size={16} className="text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 block">Pesan WhatsApp</label>
            <textarea 
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              placeholder="Tulis pengumuman di sini..."
              className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl h-48 font-medium text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all resize-none shadow-inner"
            />
            <button 
              onClick={openBroadcastModal}
              className="w-full bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:-translate-y-1 transition-all"
            >
              <Send size={16} /> Konfirmasi Kirim
            </button>
          </div>
        </div>
      </div>

      {/* Internal Modal for Confirmation */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="font-black text-lg text-slate-800 mb-1">Konfirmasi Pesan</h3>
            <p className="text-xs text-slate-500 font-bold mb-4">Target: <span className="uppercase text-emerald-600">{broadcastTarget.replace('_', ' ')}</span></p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 max-h-40 overflow-y-auto">
              <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap">{broadcastMsg}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBroadcastModalOpen(false)} disabled={broadcastLoading} className="flex-1 py-3 bg-white border-2 border-slate-100 text-slate-500 font-bold rounded-xl text-xs uppercase">Batal</button>
              <button onClick={confirmBroadcast} disabled={broadcastLoading} className="flex-[2] py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase shadow-lg flex items-center justify-center gap-2">
                {broadcastLoading ? 'Mengirim...' : <><Send size={16} /> Kirim Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};