import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BookOpen, Clock, LayoutDashboard, HeartHandshake, PenTool } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  
  const desktopLinkClass = (path: string) => `
    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
    ${isActive(path) 
      ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
  `;

  const mobileLinkClass = (path: string) => `
    flex flex-col items-center gap-1 p-2 rounded-xl transition-all 
    ${isActive(path) ? 'text-blue-600 bg-blue-50' : 'text-slate-400'}
  `;

  // Cek Role
  const isAdmin = user?.peran === 'admin';
  const isTeacher = user?.peran === 'wali_kelas';
  const isContributor = user?.peran === 'kontributor';
  const isParent = user?.peran === 'orang_tua';
  const isStudent = user?.peran === 'siswa';

  // [MODIFIKASI PENTING] 
  // Jika user adalah ADMIN, kita kembalikan 'children' saja tanpa Layout bawaan.
  // Ini mencegah "Double Navbar" karena AdminDashboard sudah punya Navbar sendiri.
  if (isAdmin) {
    return <>{children}</>;
  }

  // --- Layout Standar untuk Siswa, Guru, Ortu, Kontributor ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 sm:pb-0">
      
      {/* Navbar Atas (Desktop & Mobile) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-3">
             <img 
               src="/logosmpn6pekalongan.png" 
               alt="Logo SMPN 6 Pekalongan" 
               className="h-9 w-auto object-contain" 
             />
             <div className="leading-tight">
               <h1 className="text-sm font-bold uppercase tracking-tight">SMPN 6 Pekalongan</h1>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Kokurikuler App</p>
             </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1 bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
            {isStudent && (
              <>
                <Link to="/" className={desktopLinkClass('/')}>
                  <BookOpen size={18} /> <span>Isi Jurnal</span>
                </Link>
                <Link to="/history" className={desktopLinkClass('/history')}>
                  <Clock size={18} /> <span>Riwayat</span>
                </Link>
              </>
            )}

            {isTeacher && (
              <Link to="/teacher-dashboard" className={desktopLinkClass('/teacher-dashboard')}>
                <LayoutDashboard size={18} /> <span>Dashboard Kelas</span>
              </Link>
            )}

            {isParent && (
              <Link to="/parent-dashboard" className={desktopLinkClass('/parent-dashboard')}>
                <HeartHandshake size={18} /> <span>Anak Saya</span>
              </Link>
            )}

            {isContributor && (
               <Link to="/contributor-dashboard" className={desktopLinkClass('/contributor-dashboard')}>
                 <PenTool size={18} /> <span>Input Poin</span>
               </Link>
            )}
            
            {/* Link Admin dihapus dari sini karena Admin punya layout sendiri */}
          </nav>
          
          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{user?.nama}</p>
              <div className="flex items-center justify-end gap-1">
                <span className={`text-[9px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-wide ${
                  isTeacher ? 'bg-indigo-600' : 
                  isParent ? 'bg-rose-600' : 
                  isContributor ? 'bg-blue-600' : 'bg-emerald-600'
                }`}>
                  {user?.peran?.replace('_', ' ')}
                </span>
                {user?.kelas && (
                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                    • {user.kelas}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-full text-slate-600 transition-all border border-transparent hover:border-rose-200" 
              title="Keluar Aplikasi"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 fade-in">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 sm:hidden flex justify-around items-center z-50 no-print safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        
        {isStudent && (
          <>
            <Link to="/" className={mobileLinkClass('/')}>
              <BookOpen size={20} />
              <span className="text-[9px] font-black uppercase">Jurnal</span>
            </Link>
            <Link to="/history" className={mobileLinkClass('/history')}>
              <Clock size={20} />
              <span className="text-[9px] font-black uppercase">Riwayat</span>
            </Link>
          </>
        )}

        {isTeacher && (
          <Link to="/teacher-dashboard" className={mobileLinkClass('/teacher-dashboard')}>
            <LayoutDashboard size={20} />
            <span className="text-[9px] font-black uppercase">Kelas</span>
          </Link>
        )}

        {isParent && (
          <Link to="/parent-dashboard" className={mobileLinkClass('/parent-dashboard')}>
            <HeartHandshake size={20} />
            <span className="text-[9px] font-black uppercase">Anak</span>
          </Link>
        )}

        {isContributor && (
          <Link to="/contributor-dashboard" className={mobileLinkClass('/contributor-dashboard')}>
            <PenTool size={20} />
            <span className="text-[9px] font-black uppercase">Input</span>
          </Link>
        )}
        
        {/* Tombol Logout Mobile */}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
          <LogOut size={20} />
          <span className="text-[9px] font-black uppercase">Keluar</span>
        </button>
      </div>
    </div>
  );
};