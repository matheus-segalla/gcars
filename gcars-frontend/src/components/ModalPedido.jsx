import React, { useState } from 'react';
import {
  X,
  Printer,
  User,
  Wrench,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

export default function ModalPedido({ isOpen, os, onClose }) {
  if (!isOpen || !os) return null;

  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const totalPecas = Number(os.pecas || 0);
  const totalMaoObra = Number(os.mao_obra || 0);
  const desconto = Number(os.desconto || 0);
  const totalGeral = Number(os.total || (totalPecas + totalMaoObra - desconto));
  const valorPago = Number(os.valor_pago || 0);
  const saldoRestante = Math.max(0, totalGeral - valorPago);
  const servicos = Array.isArray(os.servicos) ? os.servicos : [];
  // Tratamento tolerante para fotos (seja array, string JSON ou null)
  let fotos = [];
  const dadoBrutoFotos = os.fotos || os.fotos_json;

  if (Array.isArray(dadoBrutoFotos)) {
    fotos = dadoBrutoFotos;
  } else if (typeof dadoBrutoFotos === 'string' && dadoBrutoFotos.trim() !== '') {
    try {
      const parseado = JSON.parse(dadoBrutoFotos);
      fotos = Array.isArray(parseado) ? parseado : [];
    } catch (e) {
      // Se for uma URL única direta em string
      if (dadoBrutoFotos.startsWith('http')) {
        fotos = [dadoBrutoFotos];
      }
    }
  }


  // 🖨️ Função de Impressão Profissional (Janela Limpa A4 sem mecânico)
  const handleImprimir = () => {
    const janelaPrint = window.open('', '_blank', 'width=900,height=700');
    if (!janelaPrint) return;

    const servicosHtml = servicos.length > 0
      ? servicos.map((s, idx) => `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; width: 40px; text-align: center; color: #6b7280; font-family: monospace;">
              #${String(idx + 1).padStart(2, '0')}
            </td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #1f2937;">
              ${s}
            </td>
          </tr>
        `).join('')
      : `<tr><td colspan="2" style="padding: 16px; text-align: center; color: #6b7280;">Nenhum serviço discriminado.</td></tr>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ordem de Serviço #${os.numero_orcamento || os.id}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 0; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 16px; }
          .empresa h1 { margin: 0; font-size: 24px; font-weight: 900; font-style: italic; letter-spacing: 0.5px; }
          .empresa p { margin: 2px 0 0 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #dc2626; }
          .doc-info { text-align: right; }
          .doc-info .num { font-size: 22px; font-weight: 900; color: #dc2626; margin: 0; }
          .doc-info .data { font-size: 12px; color: #4b5563; margin-top: 4px; }
          .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border: 1px solid #111827; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 12px; }
          .info-group { margin-bottom: 6px; }
          .info-label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #6b7280; display: block; margin-bottom: 2px; }
          .info-value { font-size: 13px; font-weight: bold; color: #111827; }
          .table-servicos { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
          .table-servicos th { background: #f3f4f6; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #4b5563; border-bottom: 1px solid #e5e7eb; }
          .totais-container { display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #111827; padding-top: 12px; }
          .termos { font-size: 10px; color: #6b7280; max-width: 55%; line-height: 1.4; }
          .totais-box { width: 220px; border: 1px solid #111827; border-radius: 8px; padding: 10px 14px; font-size: 12px; }
          .totais-linha { display: flex; justify-content: space-between; margin-bottom: 4px; color: #4b5563; }
          .total-destaque { font-size: 15px; font-weight: 900; color: #16a34a; border-top: 1px solid #e5e7eb; padding-top: 4px; margin-top: 4px; }
          .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; text-align: center; font-size: 11px; }
          .assinatura-linha { border-top: 1px solid #111827; padding-top: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="empresa">
            <h1>G CARS</h1>
            <p>Reparos & Serviços Automotivos</p>
            <span style="font-size: 11px; color: #6b7280;">Comprovante de Execução e Orçamento</span>
          </div>
          <div class="doc-info">
            <div class="num">OS #${os.numero_orcamento || os.id}</div>
            <div class="data">Data: <strong>${os.data}</strong></div>
          </div>
        </div>

        <div class="grid-info">
          <div>
            <div class="info-group">
              <span class="info-label">Cliente</span>
              <span class="info-value">${os.cliente}</span>
            </div>
            <div class="info-group" style="margin-bottom: 0;">
              <span class="info-label">Forma de Pagamento</span>
              <span class="info-value">${os.forma_pagamento || 'A combinar'}</span>
            </div>
          </div>
          <div>
            <div class="info-group">
              <span class="info-label">Veículo / Placa</span>
              <span class="info-value">${os.veiculo}</span>
            </div>
            ${os.km ? `
              <div class="info-group" style="margin-bottom: 0;">
                <span class="info-label">KM Atual</span>
                <span class="info-value">${os.km} km</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; color: #374151;">
          Serviços e Peças Aplicadas
        </div>

        <table class="table-servicos">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">Item</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            ${servicosHtml}
          </tbody>
        </table>

        <div class="totais-container">
          <div class="termos">
            • Garantia legal de 90 dias para peças e serviços conforme o art. 26 do CDC.<br/>
            • Peças substituídas ficam à disposição do cliente por até 48 horas após a entrega.
          </div>

          <div class="totais-box">
            <div class="totais-linha"><span>Peças:</span> <span>R$ ${totalPecas.toFixed(2)}</span></div>
            <div class="totais-linha"><span>Mão de Obra:</span> <span>R$ ${totalMaoObra.toFixed(2)}</span></div>
            ${desconto > 0 ? `<div class="totais-linha" style="color: #dc2626; font-weight: bold;"><span>Desconto:</span> <span>- R$ ${desconto.toFixed(2)}</span></div>` : ''}
            <div class="totais-linha total-destaque">
              <span>TOTAL:</span>
              <span>R$ ${totalGeral.toFixed(2)}</span>
            </div>
            ${saldoRestante > 0 ? `
              <div class="totais-linha" style="color: #d97706; font-weight: bold; border-top: 1px dashed #d1d5db; margin-top: 4px; padding-top: 4px;">
                <span>Resta Pagar:</span>
                <span>R$ ${saldoRestante.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="assinaturas">
          <div>
            <div class="assinatura-linha">G CARS OFICINA MECÂNICA</div>
            <span style="color: #6b7280; font-size: 10px;">Assinatura do Responsável</span>
          </div>
          <div>
            <div class="assinatura-linha">${os.cliente}</div>
            <span style="color: #6b7280; font-size: 10px;">Assinatura do Cliente</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `;

    janelaPrint.document.open();
    janelaPrint.document.write(html);
    janelaPrint.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#121417] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-white my-8">

        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
                <circle cx="7.5" cy="14.5" r="1.5" />
                <circle cx="16.5" cy="14.5" r="1.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-wide uppercase">
                ORDEM DE SERVIÇO #{os.numero_orcamento || os.id}
              </h3>
              <p className="text-[11px] text-zinc-400">Detalhes completos do atendimento</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4 text-black" />
              Imprimir / Salvar PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-500 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Título e Talão */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black italic tracking-wide">
              G CARS REPAROS AUTOMOTIVOS
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">Comprovante de Execução e Orçamento</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-red-600/20 border border-red-500/40 text-red-500 text-xs font-black px-2.5 py-0.5 rounded-md uppercase">
              OS #{os.numero_orcamento || os.id}
            </span>
            <span className="block text-[11px] text-zinc-400 mt-1">
              Data: {os.data}
            </span>
          </div>
        </div>

        {/* Box Cliente & Veículo */}
        <div className="bg-[#0b0c0e] border border-zinc-800/90 rounded-2xl p-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">CLIENTE</span>
            <span className="text-sm font-bold text-white block">{os.cliente}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">VEÍCULO / PLACA</span>
            <span className="text-sm font-bold text-white block">{os.veiculo}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">MECÂNICO RESPONSÁVEL</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-200">
              <User className="w-3.5 h-3.5 text-red-500" />
              {os.mecanico || 'Não atribuído'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">FORMA DE PAGAMENTO</span>
            <span className="text-xs font-bold text-zinc-200">{os.forma_pagamento || 'N/A'}</span>
          </div>
        </div>

        {/* Lista de Serviços */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <Wrench className="w-4 h-4 text-red-500" />
            <span>SERVIÇOS & PEÇAS DESCRITAS</span>
          </div>

          <div className="bg-[#0b0c0e] border border-zinc-800/90 rounded-2xl p-4 divide-y divide-zinc-800/80 text-xs">
            {servicos.length > 0 ? (
              servicos.map((s, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-zinc-200 font-medium">{s}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-3 text-zinc-500 text-xs">
                Nenhum serviço registrado nesta ordem.
              </div>
            )}
          </div>
        </div>

        {/* 📷 Fotos Anexadas do Talão/Orçamento */}
        {fotos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-300">
              <ImageIcon className="w-4 h-4 text-red-500" />
              <span>FOTOS ANEXADAS ({fotos.length})</span>
            </div>

            <div className="bg-[#0b0c0e] border border-zinc-800/90 rounded-2xl p-3 flex gap-3 overflow-x-auto">
              {fotos.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setFotoAmpliada(url)}
                  className="relative group cursor-pointer shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-zinc-800 hover:border-red-500 transition"
                >
                  <img src={url} alt={`Talão ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé Financeiro */}
        <div className="bg-[#0b0c0e] border border-zinc-800/90 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-medium">Peças:</span>
            <span className="font-bold text-white text-sm">R$ {totalPecas.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-medium">Mão de Obra:</span>
            <span className="font-bold text-white text-sm">R$ {totalMaoObra.toFixed(2)}</span>
          </div>

          {desconto > 0 && (
            <div>
              <span className="text-[10px] text-amber-500 block uppercase font-medium">Desconto:</span>
              <span className="font-bold text-amber-400 text-sm">- R$ {desconto.toFixed(2)}</span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">Total da OS:</span>
            <span className="text-lg font-black text-emerald-400">R$ {totalGeral.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* Visualizador de Foto em Tela Cheia */}
      {fotoAmpliada && (
        <div
          onClick={() => setFotoAmpliada(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={fotoAmpliada} alt="Talão em tamanho real" className="rounded-xl max-h-[85vh] object-contain mx-auto" />
            <span className="text-xs text-zinc-400 block text-center mt-2">Clique em qualquer lugar para fechar</span>
          </div>
        </div>
      )}
    </div>
  );
}