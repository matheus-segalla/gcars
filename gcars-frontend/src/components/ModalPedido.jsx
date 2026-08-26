import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Car, 
  Calendar, 
  CreditCard, 
  Wrench, 
  Image as ImageIcon,
  UserCheck
} from 'lucide-react';

export default function ModalPedido({ isOpen, os, onClose }) {
  const reciboRef = useRef(null);

  if (!isOpen || !os) return null;

  const handleImprimir = () => {
    window.print();
  };

  const servicos = Array.isArray(os.servicos) ? os.servicos : [];
  const fotos = Array.isArray(os.fotos) ? os.fotos : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-md">
              <Car className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                Ordem de Serviço #{os.numero_orcamento || os.id}
              </h3>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Detalhes completos do atendimento</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImprimir}
              className="px-3.5 py-2 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Pedido (Área Imprimível) */}
        <div ref={reciboRef} className="p-5 sm:p-8 space-y-6 overflow-y-auto print:p-0 print:m-0">
          
          {/* Topo Recibo */}
          <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h1 className="text-xl font-black italic tracking-wider text-zinc-900 dark:text-white">G CARS REPAROS AUTOMOTIVOS</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Comprovante de Execução e Orçamento</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-red-600 dark:text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
                OS #{os.numero_orcamento}
              </span>
              <span className="text-xs text-zinc-500 block mt-1">Data: {os.data}</span>
            </div>
          </div>

          {/* Dados do Cliente e Veículo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Cliente</span>
              <p className="text-sm font-black text-zinc-900 dark:text-white">{os.cliente}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Veículo / Placa</span>
              <p className="text-sm font-black text-zinc-900 dark:text-white">{os.veiculo}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Mecânico Responsável</span>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-red-500" /> {os.mecanico || 'Não atribuído'}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Forma de Pagamento</span>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{os.forma_pagamento || 'Não informado'}</p>
            </div>
          </div>

          {/* Lista de Serviços */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-red-500" /> Serviços & Peças Descritas
            </h4>
            {servicos.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Nenhum detalhe de serviço registrado.</p>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {servicos.map((s, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 text-xs text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Valores */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 block">Peças:</span>
              <span className="font-bold text-zinc-900 dark:text-white">R$ {Number(os.pecas || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Mão de Obra:</span>
              <span className="font-bold text-zinc-900 dark:text-white">R$ {Number(os.mao_obra || 0).toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block font-bold">Total da OS:</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">R$ {Number(os.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Galeria de Fotos Anexadas */}
          {fotos.length > 0 && (
            <div className="print:hidden">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-red-500" /> Foto(s) do Talão Original ({fotos.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 block group aspect-video bg-zinc-100 dark:bg-zinc-950">
                    <img src={url} alt={`Talão ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}