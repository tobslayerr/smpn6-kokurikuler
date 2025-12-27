import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { BarChart3 } from 'lucide-react';

export const DashboardTab: React.FC = () => {
  const [stats, setStats] = useState<any>({ siswa: 0, guru: 0, ortu: 0, jurnal_hari_ini: 0, top_classes: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try { const res = await api.get('/admin/stats'); setStats(res.data); } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Siswa', val: stats.siswa, color: 'text-indigo-600', border: 'border-indigo-100' },
          { label: 'Jurnal Hari Ini', val: stats.jurnal_hari_ini, color: 'text-emerald-600', border: 'border-emerald-100' },
          { label: 'Ortu Terhubung', val: stats.ortu, color: 'text-rose-600', border: 'border-rose-100' },
          { label: 'Guru & Staff', val: stats.guru, color: 'text-blue-600', border: 'border-blue-100' }
        ].map((s, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-3xl border ${s.border} shadow-sm hover:shadow-md transition-all`}>
            <p className={`text-4xl font-black ${s.color} mb-1 tracking-tight`}>{s.val}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><BarChart3 size={24} /></div>
          <h3 className="font-black text-slate-800 uppercase text-lg">Statistik Kelas Terrajin</h3>
        </div>
        <div className="space-y-6">
          {stats.top_classes?.map((c: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{idx + 1}. Kelas {c.kelas}</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{c.total_input} Jurnal</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min((c.total_input / 100) * 100, 100)}%` }}></div>
              </div>
            </div>
          ))}
          {stats.top_classes?.length === 0 && <p className="text-center text-slate-400 text-sm py-10">Belum ada data jurnal bulan ini.</p>}
        </div>
      </div>
    </div>
  );
};