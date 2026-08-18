import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Wrench, 
  Car, 
  Receipt, 
  TrendingUp, 
  Loader2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import api from '../services/api';
import ModalPedido from '../components/ModalPedido';

const CORES_PAGAMENTO = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

export default function Relatorios() {
  const [periodoFiltro, setPeriodoFiltro] = useState('mes');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  // Estados do Modal de Pedido
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const handleCarregarRelatorio = async (periodo = periodoFiltro, pagina = 1) => {
    setLoading(true);
    setErro(false);
    try {
      const res = await api.get(`/api/relatorios/estatisticas?periodo=${periodo}&pagina=${pagina}&limite=10`);
      setRelatorio(res.data);
      setPaginaAtual(pagina);
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMudarPeriodo = (novoPeriodo) => {
    setPeriodoFiltro(novoPeriodo);
    handleCarregarRelatorio(novoPeriodo, 1);
  };

  const handleVerPedido = (os) => {
    setPedidoSelecionado(os);
    setModalAberto(true);
  };

  useEffect(() => {
    handleCarregarRelatorio('mes', 1);
  }, []);

  const tabelaDados = relatorio?.tabela || { itens: [], total: 0, pagina: 1, total_paginas: 1, limite: 10 };

  return (
    <div className="space-y-6">
      
      {/* Barra de Filtros de Período */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-red-500" />
          <span className="font-bold text-sm text-zinc-200">Período de Análise</span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {[
            { id: 'semana', label: 'Esta Semana' },
            { id: 'mes', label: 'Este Mês' },
            { id: 'ano', label: 'Este Ano' },
            { id: 'todos', label: 'Histórico Geral' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleMudarPeriodo(p.id)}
              disabled={loading && periodoFiltro === p.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                periodoFiltro === p.id 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Não foi possível carregar as estatísticas. Verifique a conexão com o servidor.</span>
        </div>
      )}

      {loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center gap-4 shadow-xl min-h-[420px]">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          <p className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            Atualizando Relatório & Lançamentos...
          </p>
        </div>
      ) : relatorio ? (
        <>
          {/* Cards de KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Faturamento Total</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400">R$ {relatorio.faturamento_total.toFixed(2)}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Mão de Obra (Lucro)</span>
                <Wrench className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-400">R$ {relatorio.total_mao_obra.toFixed(2)}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Peças & Insumos</span>
                <Car className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-black text-red-500">R$ {relatorio.total_pecas.toFixed(2)}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Ordens Atendidas</span>
                <Receipt className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white">{relatorio.quantidade_os}</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Ticket Médio</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400">R$ {relatorio.ticket_medio.toFixed(2)}</p>
            </div>
          </div>

          {/* Gráficos Analíticos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" /> Evolução Financeira
              </h3>
              <div className="h-64 w-full">
                {relatorio.evolucao_temporal.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                    Nenhum lançamento no período selecionado.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={relatorio.evolucao_temporal}>
                      <defs>
                        <linearGradient id="corTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="corMaoObra" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="periodo" stroke="#71717a" tick={{fontSize: 10}} />
                      <YAxis stroke="#71717a" tick={{fontSize: 10}} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="total" name="Faturamento (R$)" stroke="#ef4444" fillOpacity={1} fill="url(#corTotal)" />
                      <Area type="monotone" dataKey="mao_obra" name="Mão de Obra (R$)" stroke="#a855f7" fillOpacity={1} fill="url(#corMaoObra)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Formas de Pagamento
              </h3>
              <div className="h-64 w-full">
                {relatorio.distribuicao_pagamentos.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-500">
                    Sem pagamentos no período.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={relatorio.distribuicao_pagamentos}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {relatorio.distribuicao_pagamentos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES_PAGAMENTO[index % CORES_PAGAMENTO.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* 📋 Tabela de Pedidos do Período */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-red-500" /> Ordens do Período ({tabelaDados.total})
              </h3>
              <span className="text-[11px] text-zinc-500 font-medium">
                Filtrado por: <b className="text-zinc-300 uppercase">{periodoFiltro}</b>
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px] bg-zinc-950/70">
                    <th className="p-3.5">Nº Talão</th>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Veículo</th>
                    <th className="p-3.5">Peças</th>
                    <th className="p-3.5">Mão de Obra</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Pagamento</th>
                    <th className="p-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {tabelaDados.itens.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-zinc-500">
                        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        Nenhuma ordem registrada neste período.
                      </td>
                    </tr>
                  ) : (
                    tabelaDados.itens.map(os => (
                      <tr key={os.id} className="hover:bg-zinc-800/40 transition">
                        <td className="p-3.5 font-black text-red-500">{os.numero_orcamento}</td>
                        <td className="p-3.5 text-zinc-300">{os.data}</td>
                        <td className="p-3.5 font-semibold text-white">{os.cliente}</td>
                        <td className="p-3.5 text-zinc-300">{os.veiculo}</td>
                        <td className="p-3.5 text-zinc-400 font-medium">R$ {Number(os.pecas || 0).toFixed(2)}</td>
                        <td className="p-3.5 text-purple-400 font-medium">R$ {Number(os.mao_obra || 0).toFixed(2)}</td>
                        <td className="p-3.5 font-black text-emerald-400">R$ {Number(os.total || 0).toFixed(2)}</td>
                        <td className="p-3.5">
                          <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-medium border border-zinc-700">
                            {os.forma_pagamento || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleVerPedido(os)}
                            className="flex items-center justify-center gap-1 mx-auto px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition border border-zinc-700"
                            title="Ver Detalhes, Fotos e Recibo"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" /> Ver Pedido
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação da Tabela de Relatórios */}
            {tabelaDados.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-zinc-400">
                <div>
                  Mostrando <span className="font-bold text-white">{(tabelaDados.pagina - 1) * tabelaDados.limite + 1}</span> até{' '}
                  <span className="font-bold text-white">
                    {Math.min(tabelaDados.pagina * tabelaDados.limite, tabelaDados.total)}
                  </span>{' '}
                  de <span className="font-bold text-white">{tabelaDados.total}</span> ordens
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCarregarRelatorio(periodoFiltro, tabelaDados.pagina - 1)}
                    disabled={tabelaDados.pagina <= 1}
                    className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-white transition flex items-center gap-1 font-bold text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>

                  <span className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-bold text-zinc-300 text-xs">
                    Página {tabelaDados.pagina} de {tabelaDados.total_paginas}
                  </span>

                  <button
                    onClick={() => handleCarregarRelatorio(periodoFiltro, tabelaDados.pagina + 1)}
                    disabled={tabelaDados.pagina >= tabelaDados.total_paginas}
                    className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-white transition flex items-center gap-1 font-bold text-xs"
                  >
                    Próxima <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Modal de Detalhes Reutilizado */}
      <ModalPedido
        isOpen={modalAberto}
        os={pedidoSelecionado}
        onClose={() => setModalAberto(false)}
      />

    </div>
  );
}