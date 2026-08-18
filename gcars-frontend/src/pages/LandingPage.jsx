import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Wrench, ShieldCheck, Clock, MapPin, Phone, MessageSquare, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header Público */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/30">
              <Car className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-wider text-white italic">GCARS</h1>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase">Reparos Automotivos</p>
            </div>
          </div>

          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-300 hover:text-white transition"
          >
            <Lock className="w-3.5 h-3.5 text-red-500" /> Acesso Restrito
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 py-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4" /> Especialistas em Mecânica e Reparos
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
            Cuidado profissional e precisão para o seu veículo.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
            Diagnóstico avançado, manutenção preventiva, suspensão, freios e motor com transparência e garantia em cada serviço realizado.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noreferrer"
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-lg shadow-red-600/30 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Agendar pelo WhatsApp
            </a>
          </div>
        </section>

        {/* Destaques / Serviços */}
        <section className="border-t border-zinc-800/80 bg-zinc-900/40 py-16">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <Wrench className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Manutenção Preventiva</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Revisão completa de freios, suspensão, correias, troca de óleo e filtros para sua segurança.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <Clock className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Agilidade & Compromisso</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Orçamentos detalhados e entrega no prazo acordado, sem surpresas no valor final.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
              <MapPin className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-base font-bold text-white mb-2">Oficina Completa</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Estrutura equipada para atender veículos nacionais e importados com alto padrão técnico.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        © 2026 GCARS Reparos Automotivos. Todos os direitos reservados.
      </footer>
    </div>
  );
}