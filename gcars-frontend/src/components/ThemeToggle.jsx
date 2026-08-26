import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition duration-200 flex items-center justify-center active:scale-95 ${
        isDark
          ? 'bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700 hover:text-amber-300'
          : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900'
      } ${className}`}
      title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
      aria-label="Alternar tema"
    >
      {isDark ? (
        <Sun className="w-4 h-4 animate-in spin-in-90 duration-200" />
      ) : (
        <Moon className="w-4 h-4 animate-in spin-in-90 duration-200" />
      )}
    </button>
  );
}