import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Car, Camera, Search, BarChart3, LogOut } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { showConfirm } = useNotification();

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
    { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <>
      {/* 🖥️ Topbar (Desktop e Cabeçalho Superior Mobile) */}
      <header className="bg-zinc-900/90 border-b border-zinc-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo GCARS */}
          <div className="flex items-center gap-2.5">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/30">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black italic tracking-wider text-white">G CARS</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-700">
                Painel Oficina
              </span>
            </div>
          </div>

          {/* Links Desktop (Ocultos no celular) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition border border-zinc-700 active:scale-95"
            title="Sair do painel"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* 📱 Bottom Navigation Bar (Fixo no rodapé no celular) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 border-t border-zinc-800/90 backdrop-blur-xl px-2 py-2 safe-area-pb">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2 px-1 rounded-xl transition duration-150 active:scale-95 ${
                    isActive
                      ? 'text-red-500 bg-red-500/10 font-black'
                      : 'text-zinc-400 hover:text-zinc-200 font-medium'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}