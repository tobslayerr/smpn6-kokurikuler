import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { School, Save } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<any>({ tahun_ajaran: '', semester: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try { const res = await api.get('/admin/settings'); setSettings(res.data); } catch (e) {}
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    try { await api.post('/admin/settings', settings); toast.success('Disimpan!'); } catch (e) { toast.error('Gagal simpan'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><School size={24} /></div>
          <div>
            <h3 className="font-black text-slate-800 uppercase">Pengaturan Akademik</h3>
            <p className="text-xs text-slate-400 font-bold">Atur Tahun Ajaran & Semester</p>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 block mb-2">Tahun Ajaran Aktif</label>
            <input type="text" value={settings.tahun_ajaran} onChange={e => setSettings({...settings, tahun_ajaran: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 block mb-2">Semester</label>
            <select value={settings.semester} onChange={e => setSettings({...settings, semester: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
          
          <div className="pt-4">
            <button onClick={saveSettings} className="w-full bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 flex items-center justify-center gap-3 shadow-lg">
              <Save size={18} /> Simpan Konfigurasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};