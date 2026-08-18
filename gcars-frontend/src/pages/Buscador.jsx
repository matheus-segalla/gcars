import React, { useState, useEffect } from 'react';
import { Search, Trash2, Loader2, ChevronLeft, ChevronRight, FileSpreadsheet, AlertCircle, Eye, X } from 'lucide-react';
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

  // Estados do Modal de Visualização
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Busca paginada preservando o termo ativo
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

  // Exclusão usando o Modal e Toast do Contexto Global
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Barra de Busca com Botão de Limpar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por cliente, placa, modelo ou nº do talão..."
            value={termoBusca}
            onChange={e => setTermoBusca(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar(1, termoBusca)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-10 py-3 text-xs text-white focus:border-red-500 outline-none transition"
          />

          {termoBusca && (
            <button
              onClick={handleLimparFiltro}
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition"
              title="Limpar campo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {termoBusca && (
          <button
            onClick={handleLimparFiltro}
            disabled={loading}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-3 rounded-xl text-xs font-bold transition border border-zinc-700 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" /> Limpar
          </button>
        )}

        <button
          onClick={() => handleBuscar(1, termoBusca)}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-lg shadow-red-600/20 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </button>
      </div>

      {erroConexao && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Não foi possível conectar ao backend. Verifique se o servidor FastAPI está ativo.</span>
        </div>
      )}

      {/* Tabela de Ordens */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/40">
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
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Buscando ordens no Supabase...
                    </span>
                  </div>
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
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleVerPedido(os)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition border border-zinc-700"
                        title="Ver Detalhes e Recibo"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" /> Ver Pedido
                      </button>
                      <button
                        onClick={() => handleExcluirOS(os)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-lg transition"
                        title="Excluir OS"
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

      {/* Paginação */}
      {!loading && dados.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-zinc-400">
          <div>
            Mostrando <span className="font-bold text-white">{(dados.pagina - 1) * dados.limite + 1}</span> até{' '}
            <span className="font-bold text-white">
              {Math.min(dados.pagina * dados.limite, dados.total)}
            </span>{' '}
            de <span className="font-bold text-white">{dados.total}</span> ordens
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBuscar(dados.pagina - 1, termoBusca)}
              disabled={dados.pagina <= 1}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-white transition flex items-center gap-1 font-bold text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <span className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-bold text-zinc-300 text-xs">
              Página {dados.pagina} de {dados.total_paginas}
            </span>

            <button
              onClick={() => handleBuscar(dados.pagina + 1, termoBusca)}
              disabled={dados.pagina >= dados.total_paginas}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-white transition flex items-center gap-1 font-bold text-xs"
            >
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Detalhes / Impressão */}
      <ModalPedido
        isOpen={modalAberto}
        os={pedidoSelecionado}
        onClose={() => setModalAberto(false)}
      />

    </div>
  );
}