import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, ShieldCheck, Save } from 'lucide-react';

interface CalendarViewProps {
  entries: any[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ entries, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    const firstDayIndex = date.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = firstDayIndex; i > 0; i--) {
      days.push({ day: prevMonthLastDay - i + 1, month: month - 1, year, isCurrent: false });
    }
    
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push({ day: i, month: month, year, isCurrent: true });
    }
    
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ day: i, month: month + 1, year, isCurrent: false });
    }
    return days;
  }, [currentMonth]);

  const getEntry = (d: number, m: number, y: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return entries.find((e: any) => e.tanggal.split('T')[0] === dateStr);
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const stats = {
    total: entries.length,
    approved: entries.filter(e => e.status_ortu === 'approved').length, // Status OK (Ortu)
    validatedTeacher: entries.filter(e => e.status_guru === 'approved').length // Sah Guru
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-widest">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-white/20 rounded">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-2 text-[10px] font-black uppercase bg-white/20 rounded">Hari Ini</button>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-white/20 rounded">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 mb-2 text-center">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((dayObj, idx) => {
              const dateStr = `${dayObj.year}-${String(dayObj.month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
              const entry = getEntry(dayObj.day, dayObj.month, dayObj.year);
              const isSelected = selectedDate === dateStr;

              let statusColor = 'bg-slate-50 text-slate-700';
              if (dayObj.isCurrent) {
                if (entry) {
    // Prioritas Warna: Sah Guru (Biru) > Setuju Ortu (Hijau) > Tersimpan (Abu)
    if (entry.status_guru === 'approved') statusColor = 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
    else if (entry.status_ortu === 'approved') statusColor = 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
    else statusColor = 'bg-slate-200 text-slate-600 ring-1 ring-slate-300';
  }
              } else {
                statusColor = 'opacity-20 bg-slate-50';
              }

              if (isSelected) statusColor += ' ring-2 ring-slate-900 z-10';

              return (
                <button
                  key={idx}
                  onClick={() => dayObj.isCurrent && onDateSelect(dateStr)}
                  disabled={!dayObj.isCurrent}
                  className={`h-12 flex flex-col items-center justify-center rounded-lg transition-all text-xs font-bold relative ${statusColor}`}
                >
                  {dayObj.day}
                  {/* Dots Indicator */}
                  {entry && (
  <div className="flex gap-0.5 mt-1 justify-center">
    {/* Dot Abu: Tersimpan */}
    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
    {/* Dot Hijau: OK Ortu */}
    {entry.status_ortu === 'approved' && <div className="w-1 h-1 rounded-full bg-emerald-500"></div>}
    {/* Dot Biru: Sah Guru */}
    {entry.status_guru === 'approved' && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
  </div>
)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-center gap-4 text-[9px] font-bold uppercase text-slate-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded"></div> Tersimpan</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-300 rounded"></div> Disetujui</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-300 rounded"></div> Disahkan</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 text-white p-4 rounded-2xl flex flex-col items-center">
          <Save size={20} className="mb-1 opacity-80" />
          <span className="text-xl font-black">{stats.total}</span>
          <span className="text-[8px] uppercase tracking-widest opacity-60">Total Input</span>
        </div>
        <div className="bg-emerald-600 text-white p-4 rounded-2xl flex flex-col items-center">
          <CheckCircle size={20} className="mb-1 opacity-80" />
          <span className="text-xl font-black">{stats.approved}</span>
          <span className="text-[8px] uppercase tracking-widest opacity-60">Status OK</span>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-2xl flex flex-col items-center">
          <ShieldCheck size={20} className="mb-1 opacity-80" />
          <span className="text-xl font-black">{stats.validatedTeacher}</span>
          <span className="text-[8px] uppercase tracking-widest opacity-60">Sah Guru</span>
        </div>
      </div>
    </div>
  );
};