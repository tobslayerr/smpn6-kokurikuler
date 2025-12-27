import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

import { StudentDashboard } from './pages/student/Dashboard';
import { StudentHistory } from './pages/student/History';

import { TeacherDashboard } from './pages/teacher/Dashboard';
import { StudentReport } from './pages/teacher/StudentReport';

import { ParentDashboard } from './pages/parent/Dashboard';

import { ContributorDashboard } from './pages/contributor/Dashboard';

import { AdminDashboard } from './pages/admin/Dashboard';
import { UserDetail } from './pages/admin/UserDetail';

const ProtectedRoute: React.FC<{ children: React.ReactNode, allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 text-sm">Memuat data pengguna...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRoles && user && !allowedRoles.includes(user.peran)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-slate-50">
        <h1 className="text-4xl font-black text-slate-300 mb-2">403</h1>
        <p className="font-bold text-slate-600">Akses Ditolak</p>
        <p className="text-xs text-slate-400 mt-2">Anda login sebagai <span className="uppercase font-black text-blue-500">{user.peran.replace('_', ' ')}</span>, tidak memiliki izin ke halaman ini.</p>
        <button onClick={() => window.history.back()} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-slate-800 transition-all">Kembali</button>
      </div>
    );
  }
  
  return <Layout>{children}</Layout>;
};

const RoleBasedHome = () => {
  const { user } = useAuth();
  
  if (user?.peran === 'admin') return <Navigate to="/admin-dashboard" replace />;
  if (user?.peran === 'wali_kelas') return <Navigate to="/teacher-dashboard" replace />;
  if (user?.peran === 'kontributor') return <Navigate to="/contributor-dashboard" replace />;
  if (user?.peran === 'orang_tua') return <Navigate to="/parent-dashboard" replace />;
  
  return <StudentDashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <RoleBasedHome />
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={<ProtectedRoute allowedRoles={['siswa']}><StudentHistory /></ProtectedRoute>} />
      
      <Route path="/teacher-dashboard" element={<ProtectedRoute allowedRoles={['wali_kelas', 'admin']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/student-report/:studentId" element={<ProtectedRoute allowedRoles={['wali_kelas', 'admin']}><StudentReport /></ProtectedRoute>} />

      <Route path="/parent-dashboard" element={<ProtectedRoute allowedRoles={['orang_tua']}><ParentDashboard /></ProtectedRoute>} />

      <Route path="/contributor-dashboard" element={<ProtectedRoute allowedRoles={['kontributor']}><ContributorDashboard /></ProtectedRoute>} />

      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users/:userId" element={<ProtectedRoute allowedRoles={['admin']}><UserDetail /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{
          style: { background: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 'bold', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e11d48', secondary: '#fff' } }
        }}/>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;