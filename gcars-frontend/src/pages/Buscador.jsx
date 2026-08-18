import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  AlertCircle, 
  Eye, 
  X,
  Car,
  Calendar,
  CreditCard
} from 'lucide-react';
import api from '../services/api';
import ModalPedido from '../components/ModalPedido';
import { useNotification } from '../contexts/NotificationContext';

export default function Buscador() {
  const { showToast, showConfirm } = useNotification();

  const [termoBusca, setTermoBusca] = useState('');
  const [dados, setDados] = useState({
    itens: [],
    total: 0,
    pagina: 1,
    total_paginas: 1,
    limite: 10
  });
  const [loading, setLoading] = useState(false);
  const [erroConexao, setErroConexao] = useState(false);

  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const handleBuscar = async (paginaAlvo = 1, termo = termoBusca) => {
    setLoading(true);
    setErroConexao(false);
    try {
      const res = await api.get(
        `/api/ordens-servico/buscar?q=${encodeURIComponent(termo)}&pagina=${paginaAlvo}&limite=10`
      );
      setDados(res.data);
    } catch (err) {
      console.error("Erro ao buscar ordens:", err);
      setErroConexao(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLimparFiltro = () => {
    setTermoBusca('');
    handleBuscar(1, '');
  };

  const handleVerPedido = (os) => {
    setPedidoSelecionado(os);
    setModalAberto(true);
  };

  const handleExcluirOS = (os) => {
    showConfirm({
      titulo: "Excluir Ordem de Serviço?",
      mensagem: `Deseja realmente apagar a OS #${os.numero_orcamento} (ID: ${os.id})? Todos os dados vinculados serão removidos.`,
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar",
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/api/ordens-servico/${os.id}`);
          showToast(`OS #${os.numero_orcamento} excluída com sucesso!`, "sucesso");
          handleBuscar(dados.pagina, termoBusca);
        } catch (err) {
          showToast(err.response?.data?.detail || err.message, "erro");
        }
      }
    });
  };

  useEffect(() => {
    handleBuscar(1, '');
  }, []);

  const listaOrdens = Array.isArray(dados?.itens) ? dados.itens : [];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
      
      {/* Barra de Busca */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cliente, placa, talão..."
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar(1, termoBusca)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:border-red-500 outline-none transition"
          />
          {termoBusca && (
            <button
              onClick={handleLimparFiltro}
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {termoBusca && (
          <button
            onClick={handleLimparFiltro}
            disabled={loading}
            className="hidden sm:flex bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl text-xs font-bold transition border border-zinc-700 items-center gap-1.5"
          >
            Limpar
          </button>
        )}

        <button
          onClick={() => handleBuscar(1, termoBusca)}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 sm:px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-lg shadow-red-600/20 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      {erroConexao && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Não foi possível conectar ao servidor. Verifique sua conexão.</span>
        </div>
      )}

      {/* 📱 1. MODO MOBILE: Lista de Cards Elegantes */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-zinc-950/60 rounded-xl border border-zinc-800">
            <Loader2 className="w-7 h-7 text-red-500 animate-spin mx-auto mb-2" />
            <span className="text-xs text-zinc-400 uppercase font-bold">Buscando ordens...</span>
          </div>
        ) : listaOrdens.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-zinc-950/40 rounded-xl border border-zinc-800">
            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
            Nenhuma ordem encontrada.
          </div>
        ) : (
          listaOrdens.map(os => (
            <div key={os.id} className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500">OS #{os.id}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{os.cliente}</h4>
                </div>
                <span className="text-xs font-black text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                  Talão #{os.numero_orcamento}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                <div className="flex items-center gap-1.5 truncate">
                  <Car className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span className="truncate">{os.veiculo}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span>{os.data}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span>{os.forma_pagamento || 'Não informado'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Total</span>
                  <span className="text-base font-black text-emerald-400">R$ {Number(os.total || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerPedido(os)}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 border border-zinc-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" /> Ver Pedido
                  </button>
                  <button
                    onClick={() => handleExcluirOS(os)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🖥️ 2. MODO DESKTOP: Tabela Tradicional */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/40">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px] bg-zinc-950/70">
              <th className="p-3.5">ID</th>
              <th className="p-3.5">Nº Talão</th>
              <th className="p-3.5">Data</th>
              <th className="p-3.5">Cliente</th>
              <th className="p-3.5">Veículo</th>
              <th className="p-3.5">Total</th>
              <th className="p-3.5">Pagamento</th>
              <th className="p-3.5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {loading ? (
              <tr>
                <td colSpan="8" className="p-12 text-center text-zinc-400">
                  <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Buscando ordens no Supabase...
                  </span>
                </td>
              </tr>
            ) : listaOrdens.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-10 text-center text-zinc-500">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            ) : (
              listaOrdens.map(os => (
                <tr key={os.id} className="hover:bg-zinc-800/40 transition">
                  <td className="p-3.5 font-mono text-zinc-500">#{os.id}</td>
                  <td className="p-3.5 font-black text-red-500">{os.numero_orcamento}</td>
                  <td className="p-3.5 text-zinc-300">{os.data}</td>
                  <td className="p-3.5 font-semibold text-white">{os.cliente}</td>
                  <td className="p-3.5 text-zinc-300">{os.veiculo}</td>
                  <td className="p-3.5 font-black text-emerald-400">R$ {Number(os.total || 0).toFixed(2)}</td>
                  <td className="p-3.5">
                    <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md text-[10px] font-medium border border-zinc-700">
                      {os.forma_pagamento || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleVerPedido(os)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition border border-zinc-700"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> Ver Pedido
                      </button>
                      <button
                        onClick={() => handleExcluirOS(os)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação Adaptativa */}
      {!loading && dados.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-zinc-400">
          <div className="text-center sm:text-left">
            Total: <span className="font-bold text-white">{dados.total}</span> ordens
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => handleBuscar(dados.pagina - 1, termoBusca)}
              disabled={dados.pagina <= 1}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-white transition flex items-center gap-1 font-bold text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <span className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 font-bold text-zinc-300 text-xs">
              {dados.pagina} / {dados.total_paginas}
            </span>

            <button
              onClick={() => handleBuscar(dados.pagina + 1, termoBusca)}
              disabled={dados.pagina >= dados.total_paginas}
              className="px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-white transition flex items-center gap-1 font-bold text-xs"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalhes / Recibo */}
      <ModalPedido
        isOpen={modalAberto}
        os={pedidoSelecionado}
        onClose={() => setModalAberto(false)}
      />

    </div>
  );
}