import React from 'react';

interface HabitCardProps {
  label: string;
  description: string;
  value: string;
  onChange: (val: string) => void;
  type?: 'text' | 'time' | 'textarea';
}

export const HabitCard: React.FC<HabitCardProps> = ({ label, description, value, onChange, type = 'textarea' }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
      <div className="mb-3">
        <label className="block text-xs font-black text-slate-800 uppercase tracking-widest mb-1">{label}</label>
        <p className="text-[10px] text-slate-400 font-medium italic">{description}</p>
      </div>
      
      {type === 'time' ? (
        <input 
          type="time" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      ) : type === 'textarea' ? (
        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ceritakan aktivitas ${label.toLowerCase()}...`}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      ) : (
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
        />
      )}
    </div>
  );
};