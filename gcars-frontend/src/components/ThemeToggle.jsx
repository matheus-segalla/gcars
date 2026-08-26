import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all duration-300 active:scale-95 shadow-sm ${
        isDark
          ? 'bg-zinc-900 border-zinc-700 text-amber-400 hover:border-amber-500/50 hover:bg-zinc-800'
          : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-200'
      }`}
      title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          <span className="hidden sm:inline text-zinc-200 text-[11px]">Claro</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-300" />
          <span className="hidden sm:inline text-zinc-700 text-[11px]">Escuro</span>
        </>
      )}
    </button>
  );
}