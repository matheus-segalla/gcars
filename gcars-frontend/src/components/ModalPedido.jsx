import React, { useState } from 'react';
import { X, Printer, Car, Wrench, Calendar, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function ModalPedido({ os, isOpen, onClose }) {
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  if (!isOpen || !os) return null;

  const handleImprimir = () => {
    window.print();
  };

  let fotos = [];
  try {
    if (Array.isArray(os.fotos)) {
      fotos = os.fotos;
    } else if (typeof os.fotos === 'string' && os.fotos.trim() !== '') {
      if (os.fotos.startsWith('[') || os.fotos.startsWith('{')) {
        fotos = JSON.parse(os.fotos);
      } else {
        fotos = [os.fotos];
      }
    }
  } catch (e) {
    fotos = [];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      
      {/* Caixa do Modal (Bottom-Sheet no celular, janela flutuante no Desktop) */}
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              Ordem #{os.numero_orcamento}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImprimir}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Imprimir / Salvar PDF</span><span className="sm:hidden">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div id="recibo-impressao" className="p-4 sm:p-6 overflow-y-auto space-y-5 text-zinc-100 bg-zinc-900 print:bg-white print:text-black print:p-8">
          
          {/* Header da Oficina */}
          <div className="border-b border-zinc-800 pb-3 print:border-black flex justify-between items-start">
            <div>
              <h2 className="text-lg sm:text-xl font-black italic tracking-wider text-red-500 print:text-black flex items-center gap-2">
                <Car className="w-5 h-5 stroke-[2.5] print:hidden" /> GCARS
              </h2>
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 print:text-zinc-700 uppercase tracking-wider">
                Reparos Automotivos
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-red-400 print:text-black block">
                TALÃO #{os.numero_orcamento}
              </span>
              <span className="text-[11px] text-zinc-400 print:text-zinc-600 flex items-center justify-end gap-1 mt-0.5">
                <Calendar className="w-3 h-3 print:hidden" /> {os.data}
              </span>
            </div>
          </div>

          {/* Cliente e Veículo */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 print:bg-zinc-50 print:border-zinc-300 text-xs">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 print:text-zinc-600 uppercase tracking-wider block">
                Cliente
              </span>
              <p className="font-bold text-white print:text-black mt-0.5">{os.cliente}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 print:text-zinc-600 uppercase tracking-wider block">
                Veículo / Placa
              </span>
              <p className="font-bold text-white print:text-black mt-0.5">{os.veiculo}</p>
            </div>
          </div>

          {/* Serviços e Peças */}
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 print:text-black mb-2 block flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-red-500 print:hidden" /> Serviços & Peças
            </span>
            <div className="bg-zinc-950/40 rounded-xl border border-zinc-800/80 print:bg-white print:border-zinc-300 overflow-hidden">
              <ul className="divide-y divide-zinc-800/60 print:divide-zinc-200 text-xs">
                {os.servicos && os.servicos.length > 0 ? (
                  os.servicos.map((item, index) => (
                    <li key={index} className="p-2.5 sm:p-3 flex items-start gap-2 text-zinc-300 print:text-black">
                      <span className="text-red-500 font-bold print:text-black">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-zinc-500">Nenhum item descritivo registrado.</li>
                )}
              </ul>
            </div>
          </div>

          {/* 📸 Fotos Originais do Talão */}
          {fotos.length > 0 && (
            <div className="print:hidden">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-2 block flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Foto(s) do Talão ({fotos.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {fotos.map((url, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video">
                    <img src={url} alt={`Folha ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => setFotoAmpliada(url)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[10px] font-bold"
                      >
                        Ampliar
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resumo Financeiro */}
          <div className="border-t border-zinc-800 pt-3.5 print:border-black space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Peças:</span>
              <span className="font-semibold text-zinc-200">R$ {Number(os.pecas || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Mão de Obra:</span>
              <span className="font-semibold text-zinc-200">R$ {Number(os.mao_obra || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Pagamento:</span>
              <span className="font-semibold text-zinc-200">{os.forma_pagamento || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-zinc-800/80">
              <span className="text-white uppercase">Total:</span>
              <span className="text-emerald-400 text-base">R$ {Number(os.total || 0).toFixed(2)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Modal Zoom da Foto */}
      {fotoAmpliada && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-2">
          <button
            onClick={() => setFotoAmpliada(null)}
            className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-red-600 text-white rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={fotoAmpliada} alt="Talão" className="max-w-full max-h-[88vh] object-contain rounded-xl" />
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #recibo-impressao, #recibo-impressao * { visibility: visible; }
          #recibo-impressao {
            position: fixed; left: 0; top: 0; width: 100%; height: auto;
            margin: 0; padding: 20px; background: white !important; color: black !important;
          }
        }
      `}</style>
    </div>
  );
}