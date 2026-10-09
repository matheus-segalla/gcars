import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Car, Camera, Search, BarChart3, Users, LogOut, Bell } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import ThemeToggle from './ThemeToggle';
import api from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const { showConfirm } = useNotification();
  const [totalAlertas, setTotalAlertas] = useState(0);

  useEffect(() => {
    let montado = true;
    async function checarAlertas() {
      try {
        const res = await api.get('/api/lembretes/contadores');
        if (montado && res.data) {
          // Destaca vencidos + hoje; se não houver, mostra próximos 7 dias
          const urgentes = (res.data.vencidos || 0) + (res.data.hoje || 0);
          setTotalAlertas(urgentes > 0 ? urgentes : 0);
        }
      } catch {
        // Silencioso se o backend estiver iniciando
      }
    }
    checarAlertas();
    const interval = setInterval(checarAlertas, 60000);
    return () => {
      montado = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    showConfirm({
      titulo: 'Sair do Sistema?',
      mensagem: 'Deseja encerrar sua sessão de administrador?',
      confirmText: 'Sair',
      cancelText: 'Continuar logado',
      isDanger: true,
      onConfirm: () => {
        localStorage.removeItem('gcars_token');
        navigate('/login');
      },
    });
  };

  const navItems = [
    { to: '/admin', label: 'Digitalizar', icon: Camera, end: true },
    { to: '/admin/buscar', label: 'Buscador', icon: Search },
    { to: '/admin/avisos', label: 'Avisos', icon: Bell, badge: totalAlertas },
    { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
    { to: '/admin/equipe', label: 'Equipe', icon: Users },
  ];

  return (
    <>
      <header className="bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/30">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black italic tracking-wider text-zinc-900 dark:text-white">G CARS</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
                Painel Oficina
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>

                  {item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-black rounded-full animate-pulse shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition border border-zinc-200 dark:border-zinc-700 active:scale-95"
              title="Sair do painel"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navegação Mobile Inferior */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200 dark:border-zinc-800/90 backdrop-blur-xl px-2 py-2 safe-area-pb transition-colors duration-200">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition duration-150 active:scale-95 ${
                    isActive
                      ? 'text-red-600 dark:text-red-500 bg-red-500/10 font-black'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
                  }`
                }
              >
                <div className="relative">
                  <Icon className="w-5 h-5 mb-1" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}