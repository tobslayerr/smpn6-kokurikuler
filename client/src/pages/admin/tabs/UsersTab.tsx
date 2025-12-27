import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { UserCard } from '../../../components/admin/UserCard';

export const UsersTab: React.FC = () => {
  const navigate = useNavigate(); // Hook untuk navigasi
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State Filter
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try { 
      // Mengambil data user sesuai filter
      const res = await api.get(`/admin/users?search=${search}&role=${filterRole}`); 
      setUsers(res.data.data || res.data); // Handle jika response dibungkus 'data' atau array langsung
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(delay);
  }, [search, filterRole]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest hidden md:block">
            Database User ({users.length})
          </h3>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={filterRole} 
              onChange={e => setFilterRole(e.target.value)} 
              className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-100 min-w-[120px]"
            >
              <option value="">Semua Role</option>
              <option value="siswa">Siswa</option>
              <option value="wali_kelas">Guru</option>
              <option value="kontributor">Kontributor</option> {/* Filter Kontributor ditambahkan */}
              <option value="orang_tua">Ortu</option>
            </select>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari Nama / NIS..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Memuat data pengguna...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map(user => (
            <UserCard 
              key={user.id} 
              user={user} 
              // Saat diklik, pindah ke halaman Detail
              onClick={(u) => navigate(`/admin/users/${u.id}`)} 
            />
          ))}
          {users.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
              Tidak ada user ditemukan.
            </div>
          )}
        </div>
      )}
      
      {/* Modal Management dihapus karena sudah menggunakan UserDetail page */}
    </div>
  );
};