import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Lazy loading das páginas (Code-Splitting sob demanda)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Digitalizar = lazy(() => import('./pages/Digitalizar'));
const Buscador = lazy(() => import('./pages/Buscador'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const Equipe = lazy(() => import('./pages/Equipe'));

// Loader suave para a área interna (mantém a Navbar estável)
function InnerLoader() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
    </div>
  );
}

// Loader para telas cheias (Landing e Login)
function FullScreenLoader() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-red-600 selection:text-white transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8">
        <Suspense fallback={<InnerLoader />}>
          <Routes>
            <Route path="/" element={<Digitalizar />} />
            <Route path="/buscar" element={<Buscador />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/equipe" element={<Equipe />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </ThemeProvider>
  );
}