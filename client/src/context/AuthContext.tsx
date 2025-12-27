import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// PERBAIKAN DI SINI: Menambahkan properti lengkap (nomor_induk, xp, kelas, dll)
interface User {
  id: number;
  nama: string;
  peran: 'siswa' | 'wali_kelas' | 'orang_tua' | 'admin' | 'kontributor';
  nomor_induk?: string; // Tambahkan ini
  kelas?: string;       // Tambahkan ini
  xp?: number;          // Tambahkan ini (untuk gamifikasi)
  foto_profil?: string; // Tambahkan ini
  no_hp?: string;       // Tambahkan ini
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void; // Helper untuk update state user tanpa login ulang
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Ambil data user terbaru dari backend saat refresh halaman
          // Pastikan endpoint /auth/me di backend mengembalikan semua kolom (xp, nomor_induk, dll)
          const res = await api.get('/auth/me');
          
          setUser({
            id: res.data.id,
            nama: res.data.nama_lengkap, // Mapping dari nama_lengkap ke nama
            peran: res.data.peran,
            nomor_induk: res.data.nomor_induk,
            kelas: res.data.kelas,
            xp: res.data.xp,
            foto_profil: res.data.foto_profil,
            no_hp: res.data.no_hp
          });
        } catch (error) {
          console.error("Gagal memuat sesi:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Fitur tambahan: Update data user di state lokal (misal setelah naik level)
  const updateUser = (data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};