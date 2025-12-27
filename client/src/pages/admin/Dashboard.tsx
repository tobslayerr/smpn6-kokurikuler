import React, { useState } from 'react';
import { 
  Menu, X, LogOut, 
  LayoutDashboard, Users, Settings, Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardTab } from './tabs/DashboardTab';
import { UsersTab } from './tabs/UsersTab';
import { SettingsTab } from './tabs/SettingsTab';
import { BroadcastTab } from './tabs/BroadcastTab';

export const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'Data Pengguna', icon: <Users size={18} /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings size={18} /> },
    { id: 'broadcast', label: 'Pengumuman', icon: <Megaphone size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'users': return <UsersTab />;
      case 'settings': return <SettingsTab />;
      case 'broadcast': return <BroadcastTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      
      {/* =========================================================
          NAVBAR / HEADER (Desktop & Mobile)
         ========================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
        
        {/* KIRI: Logo & Judul */}
        <div className="flex items-center gap-3">
          <img src="/logosmpn6pekalongan.png" alt="Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="font-black text-slate-800 text-lg tracking-tight leading-none">ADMIN</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase md:block hidden">SMPN 6 Pekalongan</p>
          </div>
        </div>

        {/* TENGAH: Menu Navigasi (KHUSUS DESKTOP) */}
        {/* "Jangan pake sidebar sendiri" -> Kita taruh di atas sini */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === item.id
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* KANAN: User Profile & Logout (Desktop) / Burger (Mobile) */}
        <div className="flex items-center gap-4">
          
          {/* Profile Badge (Desktop Only) */}
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">Administrator</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
              AD
            </div>
            {/* Tombol Logout Desktop */}
            <button 
              onClick={logout}
              className="ml-2 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Tombol Burger (Mobile Only) */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>


      {/* =========================================================
          CONTENT AREA
         ========================================================= */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Breadcrumb Mobile (Opsional, agar user tau sedang di tab apa) */}
        <div className="md:hidden mb-6 flex items-center gap-2 text-slate-400 text-sm font-medium">
          <span>Admin</span>
          <span>/</span>
          <span className="text-indigo-600 font-bold">
            {menuItems.find(m => m.id === activeTab)?.label}
          </span>
        </div>

        {renderContent()}
      </main>


      {/* =========================================================
          MOBILE DRAWER (Menu Samping saat Burger diklik)
         ========================================================= */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-800 text-lg">Menu Navigasi</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full bg-white shadow-sm border border-slate-200">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all font-bold text-left ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Info User di Drawer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-700 font-bold">
              AD
            </div>
            <div>
              <p className="font-bold text-slate-800">Administrator</p>
              <p className="text-xs text-slate-500">SMPN 6 Pekalongan</p>
            </div>
          </div>
        </div>
      </div>


      {/* =========================================================
          MOBILE BOTTOM BAR (Khusus Logout)
         ========================================================= */}
      {/* Hanya muncul di Mobile (md:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:hidden z-30 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={logout}
          className="w-full flex justify-center items-center gap-2 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-bold text-sm active:scale-95 transition-transform hover:bg-rose-100"
        >
          <LogOut size={18} />
          <span>Keluar Aplikasi</span>
        </button>
      </div>

    </div>
  );
};

export default AdminDashboard;