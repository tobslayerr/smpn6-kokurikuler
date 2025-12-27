import React from 'react';
import { User, Shield, GraduationCap, Users } from 'lucide-react';

interface UserCardProps {
  user: any;
  onClick: (user: any) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
  const getIcon = () => {
    switch (user.peran) {
      case 'siswa': return <GraduationCap size={20} className="text-blue-500" />;
      case 'wali_kelas': return <User size={20} className="text-indigo-500" />;
      case 'orang_tua': return <Users size={20} className="text-rose-500" />;
      default: return <Shield size={20} className="text-slate-500" />;
    }
  };

  const getRoleColor = () => {
    switch (user.peran) {
      case 'siswa': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'wali_kelas': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'orang_tua': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Format peran agar lebih rapi (misal: wali_kelas -> Guru)
  const displayRole = (role: string) => {
    if (role === 'wali_kelas') return 'Guru';
    if (role === 'orang_tua') return 'Orang Tua';
    return role.replace('_', ' ');
  };

  return (
    <div 
      onClick={() => onClick(user)}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        {getIcon()}
      </div>
      
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-xl ${getRoleColor()}`}>
          {getIcon()}
        </div>
        {/* HANYA TAMPILKAN JIKA KELAS ADA */}
        {user.kelas && (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {user.kelas}
          </span>
        )}
      </div>

      <div>
        <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{user.nama_lengkap}</h4>
        <p className="text-xs text-slate-400 font-medium mb-3">{user.nomor_induk}</p>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border ${getRoleColor()}`}>
            {displayRole(user.peran)}
          </span>
        </div>
      </div>
    </div>
  );
};