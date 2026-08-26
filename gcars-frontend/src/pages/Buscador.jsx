import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Car, 
  Calendar, 
  Trash2, 
  Eye, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import api from '../services/api';
import ModalPedido from '../components/ModalPedido';
import { useNotification } from '../contexts/NotificationContext';

export default function Buscador() {
  const { showToast, showConfirm } = useNotification();

  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState({
    itens: [],
    total: 0,
    pagina: 1,
    total_paginas: 1,
    limite: 10
  });
  const [loading, setLoading] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregarOrdens = async (termo = busca, pagina = 1) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/ordens-servico/buscar?q=${encodeURIComponent(termo)}&pagina=${pagina}&limite=10`
      );
      setDados(res.data);
    } catch (err) {
      showToast('Erro ao buscar ordens de serviço.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      carregarOrdens(busca, 1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [busca]);

  const handleExcluir = (id, numero) => {
    showConfirm({
      titulo: 'Excluir Ordem de Serviço?',
      mensagem: `Tem certeza que deseja apagar permanentemente a OS #${numero || id}? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, Excluir',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/api/ordens-servico/${id}`);
          showToast(`OS #${numero || id} excluída com sucesso.`, 'sucesso');
          carregarOrdens(busca, dados.pagina);
        } catch (err) {
          showToast('Erro ao excluir OS.', 'erro');
        }
      }
    });
  };

  const handleVerPedido = (os) => {
    setPedidoSelecionado(os);
    setModalAberto(true);
  };

  const listaOrdens = Array.isArray(dados?.itens) ? dados.itens : [];

  return (
    <div className="space-y-6">
      
      {/* 🔍 Barra de Busca */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl transition-colors duration-200">
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Placa, Cliente, Carro, Nº Talão ou Mecânico..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-red-500 outline-none transition"
          />
        </div>
      </div>

      {/* 📋 Resultados da Busca */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 transition-colors duration-200">
        
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
          <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            Ordens de Serviço Encontradas
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {dados.total} resultados
          </span>
        </div>

        {/* 📱 Mobile Cards */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Loader2 className="w-7 h-7 text-red-500 animate-spin mx-auto mb-2" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-bold">Buscando ordens...</span>
            </div>
          ) : listaOrdens.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              Nenhuma ordem de serviço encontrada.
            </div>
          ) : (
            listaOrdens.map(os => (
              <div key={os.id} className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-md transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">OS #{os.id}</span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{os.cliente}</h4>
                  </div>
                  <span className="text-xs font-black text-red-600 dark:text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                    Talão #{os.numero_orcamento}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 truncate">
                    <Car className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{os.veiculo}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                    <span>{os.data}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <UserCheck className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span>Mecânico: <strong className="text-zinc-800 dark:text-zinc-200">{os.mecanico || 'Não atribuído'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Total</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">R$ {Number(os.total || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerPedido(os)}
                      className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-zinc-300 dark:border-zinc-700 active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Ver Pedido
                    </button>
                    <button
                      onClick={() => handleExcluir(os.id, os.numero_orcamento)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition border border-red-500/20 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🖥️ Desktop Tabela */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] bg-zinc-100 dark:bg-zinc-950/70">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Nº Talão</th>
                <th className="p-3.5">Data</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Veículo</th>
                <th className="p-3.5">Mecânico</th>
                <th className="p-3.5">Total (R$)</th>
                <th className="p-3.5">Pagamento</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center text-zinc-500 dark:text-zinc-400">
                    <Loader2 className="w-7 h-7 text-red-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Buscando ordens...
                    </span>
                  </td>
                </tr>
              ) : listaOrdens.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-zinc-500">
                    Nenhuma ordem encontrada.
                  </td>
                </tr>
              ) : (
                listaOrdens.map(os => (
                  <tr key={os.id} className="hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40 transition">
                    <td className="p-3.5 font-mono text-zinc-400 dark:text-zinc-500">#{os.id}</td>
                    <td className="p-3.5 font-black text-red-600 dark:text-red-500">{os.numero_orcamento}</td>
                    <td className="p-3.5 text-zinc-700 dark:text-zinc-300">{os.data}</td>
                    <td className="p-3.5 font-semibold text-zinc-900 dark:text-white">{os.cliente}</td>
                    <td className="p-3.5 text-zinc-700 dark:text-zinc-300">{os.veiculo}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-800 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md shadow-sm">
                        <UserCheck className="w-3 h-3 text-red-500" /> {os.mecanico || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">R$ {Number(os.total || 0).toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-md text-[10px] font-medium border border-zinc-200 dark:border-zinc-700">
                        {os.forma_pagamento || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVerPedido(os)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white rounded-lg text-xs font-bold transition border border-zinc-300 dark:border-zinc-700 active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Ver Pedido
                        </button>
                        <button
                          onClick={() => handleExcluir(os.id, os.numero_orcamento)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition border border-red-500/20 active:scale-95"
                          title="Excluir OS"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🔢 Paginação */}
        {!loading && dados.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              Página <span className="font-bold text-zinc-900 dark:text-white">{dados.pagina}</span> de{' '}
              <span className="font-bold text-zinc-900 dark:text-white">{dados.total_paginas}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => carregarOrdens(busca, dados.pagina - 1)}
                disabled={dados.pagina <= 1}
                className="px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:border-zinc-700 disabled:opacity-30 text-zinc-800 dark:text-white transition flex items-center gap-1 font-bold text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <button
                onClick={() => carregarOrdens(busca, dados.pagina + 1)}
                disabled={dados.pagina >= dados.total_paginas}
                className="px-3.5 py-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:border-zinc-700 disabled:opacity-30 text-zinc-800 dark:text-white transition flex items-center gap-1 font-bold text-xs"
              >
                Próxima <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      <ModalPedido
        isOpen={modalAberto}
        os={pedidoSelecionado}
        onClose={() => setModalAberto(false)}
      />

    </div>
  );
}