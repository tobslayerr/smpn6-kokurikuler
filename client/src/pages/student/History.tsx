import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarView } from '../../components/features/CalendarView';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const StudentHistory: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await api.get('/journals/my');
        setEntries(res.data);
      } catch (error) {
        console.error("Gagal ambil history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJournals();
  }, []);

  const activeEntry = entries.find((e: any) => e.tanggal.split('T')[0] === selectedDate);
  const habits = activeEntry ? JSON.parse(activeEntry.data_kebiasaan) : null;

  // Logic Next/Prev Date
  const handleNavigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Kalender */}
        <div className="lg:col-span-7">
          <CalendarView entries={entries} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Kolom Kanan: Detail View */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden h-full flex flex-col">
            
            {/* Header Detail with Navigation */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <button onClick={() => handleNavigateDate('prev')} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <div className="text-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Detail Kegiatan</h3>
                <p className="text-sm font-bold text-slate-800">
                  {format(new Date(selectedDate), 'EEEE, dd MMMM yyyy', { locale: id })}
                </p>
              </div>
              <button onClick={() => handleNavigateDate('next')} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Content Detail */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
              {activeEntry ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={`p-3 rounded-xl flex items-center gap-3 ${activeEntry.status_validasi === 'approved' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                    {activeEntry.status_validasi === 'approved' ? <CheckCircle size={20} /> : <Clock size={20} />}
                    <span className="text-xs font-black uppercase tracking-wide">
                      {activeEntry.status_validasi === 'approved' ? 'Disahkan Guru' : 'Menunggu Validasi'}
                    </span>
                  </div>

                  {/* Detail Items */}
                  <div className="space-y-4">
                    <DetailItem label="Bangun Pagi" value={habits?.jam_bangun || '-'} />
                    <DetailItem label="Tidur Malam" value={habits?.jam_tidur || '-'} />
                    <DetailItem label="Ibadah" value={habits?.ibadah_list?.join(', ') || '-'} sub={habits?.ibadah_catatan} />
                    <DetailItem label="Olahraga" value={habits?.olahraga_jenis || '-'} sub={habits?.olahraga_detail} />
                    <DetailItem label="Makan Sehat" value={habits?.makan_sehat || '-'} />
                    <DetailItem label="Belajar" value={habits?.belajar_mapel || '-'} sub={habits?.belajar_ekskul ? `Ekskul: ${habits.belajar_ekskul}` : ''} />
                    <DetailItem label="Sosial" value={habits?.sosial_aksi || '-'} />
                  </div>

                  {/* Bukti Foto */}
                  {activeEntry.bukti_foto && (
                    <div className="mt-4">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Bukti Foto</p>
                      <img 
                        src={`http://localhost:5000/uploads/${activeEntry.bukti_foto}`} 
                        alt="Bukti" 
                        className="w-full h-40 object-cover rounded-xl border border-slate-200"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                  <XCircle size={48} className="mb-2 opacity-50" />
                  <p className="font-bold text-sm">Tidak ada data</p>
                  <p className="text-xs">Kamu tidak mengisi jurnal pada tanggal ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component
const DetailItem = ({ label, value, sub }: { label: string, value: string, sub?: string }) => (
  <div className="border-b border-slate-50 pb-2 last:border-0">
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-800">{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-0.5 italic">{sub}</p>}
  </div>
);