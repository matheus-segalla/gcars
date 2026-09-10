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
  UserCheck,
  Pencil,
  X,
  Gauge
} from 'lucide-react';
import api from '../services/api';
import ModalPedido from '../components/ModalPedido';
import { useNotification } from '../contexts/NotificationContext';

const FORMAS_PAGAMENTO = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Boleto Bancário',
  'A Prazo / Faturado',
  'Transferência (TED/DOC)',
  'Outro / Pendente'
];

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

  // Estados de Edição
  const [funcionarios, setFuncionarios] = useState([]);
  const [osEditando, setOsEditando] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const carregarOrdens = async (termo = busca, pagina = 1, signal = null) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/ordens-servico/buscar?q=${encodeURIComponent(termo)}&pagina=${pagina}&limite=10`,
        { signal }
      );
      setDados(res.data);
    } catch (err) {
      // Ignora erro se a requisição foi abortada propositalmente por nova digitação
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      showToast('Erro ao buscar ordens de serviço.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const delayDebounceFn = setTimeout(() => {
      carregarOrdens(busca, 1, controller.signal);
    }, 350);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort(); // Aborta a requisição em trânsito se o usuário continuar digitando
    };
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

  const handleAbrirEdicao = (os) => {
    setOsEditando({
      id: os.id,
      numero: os.numero_orcamento || '',
      data: os.data || '',
      cliente: os.cliente || '',
      veiculo: os.veiculo_modelo || os.veiculo || '',
      placa: os.placa || '',
      km: os.km || '',
      funcionario_id: os.funcionario_id || '',
      forma_pagamento: os.forma_pagamento || '',
      pecas: os.pecas || 0,
      mao_obra: os.mao_obra || 0,
      desconto: os.desconto || 0,
      valor_pago: os.valor_pago || 0,
      servicos: (os.servicos || []).join('\n')
    });
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setSalvandoEdicao(true);

    const pecasNum = parseFloat(osEditando.pecas) || 0;
    const maoObraNum = parseFloat(osEditando.mao_obra) || 0;
    const descontoNum = parseFloat(osEditando.desconto) || 0;
    const pagoNum = parseFloat(osEditando.valor_pago) || 0;

    const payload = {
      numero: osEditando.numero,
      data: osEditando.data,
      cliente: osEditando.cliente,
      veiculo: osEditando.veiculo,
      placa: osEditando.placa,
      km: osEditando.km ? String(osEditando.km).trim() : null,
      funcionario_id: osEditando.funcionario_id ? parseInt(osEditando.funcionario_id, 10) : null,
      forma_pagamento: osEditando.forma_pagamento,
      pecas: pecasNum,
      mao_obra: maoObraNum,
      desconto: descontoNum,
      valor_pago: pagoNum,
      servicos: osEditando.servicos.split('\n').filter(s => s.trim() !== '')
    };

    try {
      await api.put(`/api/ordens-servico/${osEditando.id}`, payload);
      showToast('Ordem de serviço atualizada com sucesso!', 'sucesso');
      setOsEditando(null);
      carregarOrdens(busca, dados.pagina);
    } catch (err) {
      showToast('Erro ao atualizar: ' + (err.response?.data?.detail || err.message), 'erro');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const listaOrdens = Array.isArray(dados?.itens) ? dados.itens : [];

  // Cálculos dinâmicos dentro do Modal
  const modalPecas = parseFloat(osEditando?.pecas || 0);
  const modalMaoObra = parseFloat(osEditando?.mao_obra || 0);
  const modalDesconto = parseFloat(osEditando?.desconto || 0);
  const modalPago = parseFloat(osEditando?.valor_pago || 0);
  const modalTotal = Math.max(0, (modalPecas + modalMaoObra) - modalDesconto);
  const modalRestante = Math.max(0, modalTotal - modalPago);

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
                  {os.km && (
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                      <span>{os.km} KM</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 col-span-2">
                    <UserCheck className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                    <span>Mecânico: <strong className="text-zinc-800 dark:text-zinc-200">{os.mecanico || 'Não atribuído'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-medium">Total</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">R$ {Number(os.total || 0).toFixed(2)}</span>
                    <div className="mt-1">
                      {os.status_pagamento === 'pago' && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Pago
                        </span>
                      )}
                      {os.status_pagamento === 'parcial' && (
                        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                          Resta R$ {Number(os.restante || 0).toFixed(2)}
                        </span>
                      )}
                      {os.status_pagamento === 'pendente' && (
                        <span className="text-[9px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                          Em Aberto
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleVerPedido(os)}
                      className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 border border-zinc-300 dark:border-zinc-700 active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleAbrirEdicao(os)}
                      className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition border border-amber-500/20 active:scale-95"
                      title="Editar Ordem"
                    >
                      <Pencil className="w-4 h-4" />
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
                    <td className="p-3.5 text-zinc-700 dark:text-zinc-300">
                      <div>{os.veiculo}</div>
                      {os.km && <span className="text-[10px] text-zinc-400 font-mono">{os.km} KM</span>}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-800 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md shadow-sm">
                        <UserCheck className="w-3 h-3 text-red-500" /> {os.mecanico || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">
                      R$ {Number(os.total || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-md text-[10px] font-medium border border-zinc-200 dark:border-zinc-700">
                          {os.forma_pagamento || 'N/A'}
                        </span>
                        {os.status_pagamento === 'pago' && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            ● Pago
                          </span>
                        )}
                        {os.status_pagamento === 'parcial' && (
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                            Resta R$ {Number(os.restante || 0).toFixed(2)}
                          </span>
                        )}
                        {os.status_pagamento === 'pendente' && (
                          <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                            ● Em aberto
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleVerPedido(os)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white rounded-lg text-xs font-bold transition border border-zinc-300 dark:border-zinc-700 active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-500" /> Ver
                        </button>
                        <button
                          onClick={() => handleAbrirEdicao(os)}
                          className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg transition border border-amber-500/20 active:scale-95"
                          title="Editar Ordem"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExcluir(os.id, os.numero_orcamento)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition border border-red-500/20 active:scale-95"
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

      {/* ✏️ Modal de Edição Completa */}
      {osEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-500" /> Editar Ordem #{osEditando.numero || osEditando.id}
              </h3>
              <button
                type="button"
                onClick={() => setOsEditando(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Nº Talão / OS</label>
                  <input
                    type="text"
                    value={osEditando.numero}
                    onChange={e => setOsEditando({ ...osEditando, numero: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Data</label>
                  <input
                    type="text"
                    value={osEditando.data}
                    onChange={e => setOsEditando({ ...osEditando, data: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Cliente</label>
                  <input
                    type="text"
                    value={osEditando.cliente}
                    onChange={e => setOsEditando({ ...osEditando, cliente: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Veículo</label>
                  <input
                    type="text"
                    value={osEditando.veiculo}
                    onChange={e => setOsEditando({ ...osEditando, veiculo: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Placa</label>
                  <input
                    type="text"
                    value={osEditando.placa}
                    onChange={e => setOsEditando({ ...osEditando, placa: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">KM Rodados</label>
                  <input
                    type="number"
                    value={osEditando.km}
                    onChange={e => setOsEditando({ ...osEditando, km: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* 💰 Bloco Financeiro & Pagamentos */}
              <div className="bg-zinc-50 dark:bg-zinc-950/80 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Peças (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={osEditando.pecas}
                      onChange={e => setOsEditando({ ...osEditando, pecas: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Mão de Obra (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={osEditando.mao_obra}
                      onChange={e => setOsEditando({ ...osEditando, mao_obra: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-amber-600 dark:text-amber-400 mb-1 block font-bold">Desconto / Taxa (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={osEditando.desconto}
                      onChange={e => setOsEditando({ ...osEditando, desconto: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-amber-500/50 rounded-lg p-2 text-amber-600 dark:text-amber-400 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-600 dark:text-emerald-400 mb-1 block font-bold">Total Final (R$)</label>
                    <input
                      type="text"
                      disabled
                      value={`R$ ${modalTotal.toFixed(2)}`}
                      className="w-full bg-zinc-100 dark:bg-zinc-900/60 border border-emerald-500/40 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 font-black outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div>
                    <label className="text-zinc-700 dark:text-zinc-300 mb-1 block font-bold">Valor Já Pago (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={osEditando.valor_pago}
                      onChange={e => setOsEditando({ ...osEditando, valor_pago: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-2.5 text-emerald-600 dark:text-emerald-400 font-bold outline-none"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Saldo Pendente:</span>
                    <span className={`text-base font-black ${modalRestante > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      R$ {modalRestante.toFixed(2)} {modalRestante === 0 && '✓ Liquidado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Mecânico Responsável</label>
                  <select
                    value={osEditando.funcionario_id}
                    onChange={e => setOsEditando({ ...osEditando, funcionario_id: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Selecione o mecânico...</option>
                    {funcionarios.map(f => (
                      <option key={f.id} value={f.id}>{f.nome} ({f.cargo})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Forma de Pagamento</label>
                  <select
                    value={osEditando.forma_pagamento}
                    onChange={e => setOsEditando({ ...osEditando, forma_pagamento: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {FORMAS_PAGAMENTO.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-600 dark:text-zinc-400 mb-1 block font-medium">Serviços / Peças Realizados (um por linha)</label>
                <textarea
                  rows="3"
                  value={osEditando.servicos}
                  onChange={e => setOsEditando({ ...osEditando, servicos: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white font-mono outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOsEditando(null)}
                  className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-xl font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="px-5 py-2.5 text-white font-bold bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {salvandoEdicao ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📄 Modal Visualizador Original */}
      <ModalPedido
        isOpen={modalAberto}
        os={pedidoSelecionado}
        onClose={() => setModalAberto(false)}
      />

    </div>
  );
}