import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Car, Wrench, Camera, Search, BarChart3, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('gcars_token');
    navigate('/login');
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
      isActive
        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
        : 'text-zinc-400 hover:text-white'
    }`;

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-lg shadow-red-600/30">
            <Car className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-wider bg-gradient-to-r from-red-500 via-white to-zinc-300 bg-clip-text text-transparent italic">
              GCARS
            </h1>
            <p className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase flex items-center gap-1">
              <Wrench className="w-3 h-3 text-red-500 inline" /> Reparos Automotivos
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          <NavLink to="/admin" end className={linkClasses}>
            <Camera className="w-4 h-4" /> Digitalizar
          </NavLink>
          <NavLink to="/admin/buscar" className={linkClasses}>
            <Search className="w-4 h-4" /> Buscador
          </NavLink>
          <NavLink to="/admin/relatorios" className={linkClasses}>
            <BarChart3 className="w-4 h-4" /> Relatórios
          </NavLink>

          <button
            onClick={handleLogout}
            title="Sair do Sistema"
            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}