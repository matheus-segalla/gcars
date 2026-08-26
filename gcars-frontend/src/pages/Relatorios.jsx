import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Wrench, 
  Car, 
  Calendar, 
  CreditCard, 
  Loader2, 
  AlertCircle,
  Award,
  FileSpreadsheet,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Percent,
  Check,
  ArrowDownRight
} from 'lucide-react';
import api from '../services/api';
import ModalPedido from '../components/ModalPedido';
import { useNotification } from '../contexts/NotificationContext';

export default function Relatorios() {
  const { showToast } = useNotification();

  // Estados dos Indicadores
  const [periodo, setPeriodo] = useState('mes');
  const [dadosEstatisticas, setDadosEstatisticas] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [erroStats, setErroStats] = useState(false);

  // Estados da Listagem Paginada
  const [dadosOrdens, setDadosOrdens] = useState({
    itens: [],
    total: 0,
    pagina: 1,
    total_paginas: 1,
    limite: 8
  });
  const [loadingOrdens, setLoadingOrdens] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Estado para controlar os inputs de custos locais (edição rápida)
  const [custosLocais, setCustosLocais] = useState({});
  const [salvandoCustoId, setSalvandoCustoId] = useState(null);

  const carregarEstatisticas = async (p = periodo) => {
    setLoadingStats(true);
    setErroStats(false);
    try {
      const res = await api.get(`/api/relatorios/estatisticas?periodo=${p}`);
      setDadosEstatisticas(res.data);
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      setErroStats(true);
    } finally {
      setLoadingStats(false);
    }
  };

  const carregarOrdens = async (paginaAlvo = 1) => {
    setLoadingOrdens(true);
    try {
      const res = await api.get(`/api/ordens-servico/buscar?pagina=${paginaAlvo}&limite=8`);
      setDadosOrdens(res.data);
      
      // Inicializa os custos locais para edição
      const mapaCustos = {};
      (res.data.itens || []).forEach(item => {
        mapaCustos[item.id] = item.custo !== undefined ? item.custo : 0;
      });
      setCustosLocais(mapaCustos);
    } catch (err) {
      console.error("Erro ao carregar últimas ordens:", err);
    } finally {
      setLoadingOrdens(false);
    }
  };

  useEffect(() => {
    carregarEstatisticas(periodo);
  }, [periodo]);

  useEffect(() => {
    carregarOrdens(1);
  }, []);

  // Salva o custo automaticamente quando o usuário sai do campo (onBlur) ou tecla Enter
  const handleSalvarCusto = async (osId, novoCusto) => {
    const valorFloat = parseFloat(novoCusto) || 0;
    setSalvandoCustoId(osId);
    try {
      await api.patch(`/api/ordens-servico/${osId}/custo`, { custo: valorFloat });
      
      // Atualiza na listagem visualmente
      setDadosOrdens(prev => ({
        ...prev,
        itens: prev.itens.map(item => {
          if (item.id === osId) {
            return {
              ...item,
              custo: valorFloat,
              lucro: item.total - valorFloat
            };
          }
          return item;
        })
      }));

      // Recarrega as estatísticas financeiras do topo
      carregarEstatisticas(periodo);
      showToast(`Custo da OS #${osId} atualizado!`, "sucesso");
    } catch (err) {
      showToast("Erro ao salvar custo.", "erro");
    } finally {
      setSalvandoCustoId(null);
    }
  };

  const handleVerPedido = (os) => {
    setPedidoSelecionado(os);
    setModalAberto(true);
  };

  // Valores financeiros
  const faturamentoTotal = Number(dadosEstatisticas?.faturamento_total || 0);
  const totalOrdens = Number(dadosEstatisticas?.total_ordens || 0);
  const totalMaoObra = Number(dadosEstatisticas?.total_mao_obra || 0);
  const custoTotal = Number(dadosEstatisticas?.custo_total || 0);
  const lucroReal = Number(dadosEstatisticas?.lucro_real || 0);
  const margemLucro = Number(dadosEstatisticas?.margem_lucro || 0);
  const ticketMedio = Number(dadosEstatisticas?.ticket_medio || 0);
  const formasPagamento = Array.isArray(dadosEstatisticas?.formas_pagamento) ? dadosEstatisticas.formas_pagamento : [];
  const topServicos = Array.isArray(dadosEstatisticas?.top_servicos) ? dadosEstatisticas.top_servicos : [];
  const listaOrdens = Array.isArray(dadosOrdens?.itens) ? dadosOrdens.itens : [];

  return (
    <div className="space-y-8">
      
      {/* 🧭 Seletor de Período */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2 text-zinc-300">
          <Calendar className="w-5 h-5 text-red-500" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Período de Análise</span>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 w-full sm:w-auto">
          {[
            { id: 'semana', label: 'Esta Semana' },
            { id: 'mes', label: 'Este Mês' },
            { id: 'ano', label: 'Este Ano' },
            { id: 'geral', label: 'Histórico Geral' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider ${
                periodo === p.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {erroStats && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Não foi possível carregar as estatísticas. Verifique a conexão com o servidor.</span>
        </div>
      )}

      {loadingStats ? (
        <div className="p-16 text-center bg-zinc-900 border border-zinc-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Calculando dados financeiros e custos...
          </span>
        </div>
      ) : (
        <>
          {/* 📊 Cards de Resultados: Faturamento, Custos e Lucro Real */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* 1. Faturamento Bruto */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Faturamento</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-lg sm:text-2xl font-black text-white">
                R$ {faturamentoTotal.toFixed(2)}
              </p>
              <span className="text-[10px] text-zinc-500 block">{totalOrdens} OS no período</span>
            </div>

            {/* 2. Custos Totais (Peças/Insumos) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Custos Totais</span>
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-lg sm:text-2xl font-black text-rose-400">
                R$ {custoTotal.toFixed(2)}
              </p>
              <span className="text-[10px] text-zinc-500 block">Peças e despesas</span>
            </div>

            {/* 3. Lucro Líquido Real (Destaque Principal) */}
            <div className="col-span-2 sm:col-span-1 bg-gradient-to-b from-emerald-950/40 to-zinc-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-2 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">Lucro Real</span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-0.5">
                  <Percent className="w-2.5 h-2.5" /> {margemLucro.toFixed(0)}%
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">
                R$ {lucroReal.toFixed(2)}
              </p>
              <span className="text-[10px] text-emerald-500/80 block font-medium">Margem Líquida</span>
            </div>

            {/* 4. Mão de Obra */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Mão de Obra</span>
                <Wrench className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-lg sm:text-2xl font-black text-amber-400">
                R$ {totalMaoObra.toFixed(2)}
              </p>
              <span className="text-[10px] text-zinc-500 block">Total de serviços</span>
            </div>

            {/* 5. Ticket Médio */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-lg sm:text-2xl font-black text-purple-400">
                R$ {ticketMedio.toFixed(2)}
              </p>
              <span className="text-[10px] text-zinc-500 block">Média por veículo</span>
            </div>

          </div>

          {/* 💳 Formas de Pagamento & 🔧 Ranking de Serviços */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Formas de Pagamento */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-500" /> Formas de Pagamento
                </h3>
                <span className="text-[11px] text-zinc-400">{formasPagamento.length} métodos</span>
              </div>

              {formasPagamento.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Nenhum pagamento registrado no período.</p>
              ) : (
                <div className="space-y-3">
                  {formasPagamento.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-300">{item.metodo}</span>
                        <span className="font-bold text-white">
                          R$ {Number(item.valor || 0).toFixed(2)} 
                          <span className="text-zinc-500 font-normal ml-1">({Number(item.percentual || 0).toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                        <div
                          className="bg-red-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, item.percentual || 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ranking de Serviços / Peças */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Serviços Mais Frequentes
                </h3>
                <span className="text-[11px] text-zinc-400">Top ocorrências</span>
              </div>

              {topServicos.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Nenhum serviço registrado no período.</p>
              ) : (
                <div className="space-y-2.5">
                  {topServicos.map((serv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="text-zinc-200 font-medium truncate">{serv.descricao}</span>
                      </div>
                      <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-bold text-[11px] flex-shrink-0">
                        {serv.total}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* 📋 LISTA PAGINADA COM EDIÇÃO RÁPIDA DE CUSTO & LUCRO */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500">Gestão & Auditoria</span>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
              <FileSpreadsheet className="w-5 h-5 text-red-500" /> Últimos Serviços & Margem Real
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
            Total: <strong className="text-white">{dadosOrdens.total}</strong> ordens
          </span>
        </div>

        {/* 📱 Modo Mobile: Cards com Input de Custo */}
        <div className="block md:hidden space-y-3">
          {loadingOrdens ? (
            <div className="p-8 text-center bg-zinc-950/60 rounded-xl border border-zinc-800">
              <Loader2 className="w-7 h-7 text-red-500 animate-spin mx-auto mb-2" />
              <span className="text-xs text-zinc-400 uppercase font-bold">Carregando ordens...</span>
            </div>
          ) : listaOrdens.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 bg-zinc-950/40 rounded-xl border border-zinc-800 text-xs">
              Nenhuma ordem cadastrada no momento.
            </div>
          ) : (
            listaOrdens.map(os => {
              const custoAtual = custosLocais[os.id] !== undefined ? custosLocais[os.id] : os.custo;
              const lucroCalc = Number(os.total || 0) - Number(custoAtual || 0);

              return (
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
                      <UserCheck className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span>Mecânico: <strong className="text-zinc-200">{os.mecanico || 'Não atribuído'}</strong></span>
                    </div>
                  </div>

                  {/* Custo e Lucro no Mobile */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800 text-xs items-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Total</span>
                      <span className="font-bold text-white">R$ {Number(os.total || 0).toFixed(2)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Custo (R$)</span>
                      <input
                        type="number"
                        step="0.01"
                        value={custoAtual}
                        onChange={e => setCustosLocais({ ...custosLocais, [os.id]: e.target.value })}
                        onBlur={() => handleSalvarCusto(os.id, custosLocais[os.id])}
                        onKeyDown={e => e.key === 'Enter' && handleSalvarCusto(os.id, custosLocais[os.id])}
                        placeholder="0.00"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-xs text-rose-400 font-bold focus:border-red-500 outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Lucro Real</span>
                      <span className="font-black text-emerald-400">R$ {lucroCalc.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleVerPedido(os)}
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" /> Ver Pedido Completo
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 🖥️ Modo Desktop: Tabela de Serviços com Input Inline de Custo */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/40">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px] bg-zinc-950/70">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Nº Talão</th>
                <th className="p-3.5">Data</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Veículo</th>
                <th className="p-3.5">Mecânico</th>
                <th className="p-3.5">Total (R$)</th>
                <th className="p-3.5 w-28">Custo (R$)</th>
                <th className="p-3.5">Lucro Real</th>
                <th className="p-3.5">Pagamento</th>
                <th className="p-3.5 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loadingOrdens ? (
                <tr>
                  <td colSpan="11" className="p-10 text-center text-zinc-400">
                    <Loader2 className="w-7 h-7 text-red-500 animate-spin mx-auto mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Carregando histórico financeiro...
                    </span>
                  </td>
                </tr>
              ) : listaOrdens.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-8 text-center text-zinc-500">
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              ) : (
                listaOrdens.map(os => {
                  const custoAtual = custosLocais[os.id] !== undefined ? custosLocais[os.id] : os.custo;
                  const lucroCalc = Number(os.total || 0) - Number(custoAtual || 0);

                  return (
                    <tr key={os.id} className="hover:bg-zinc-800/40 transition">
                      <td className="p-3.5 font-mono text-zinc-500">#{os.id}</td>
                      <td className="p-3.5 font-black text-red-500">{os.numero_orcamento}</td>
                      <td className="p-3.5 text-zinc-300">{os.data}</td>
                      <td className="p-3.5 font-semibold text-white">{os.cliente}</td>
                      <td className="p-3.5 text-zinc-300">{os.veiculo}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                          <UserCheck className="w-3 h-3 text-red-400" /> {os.mecanico || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-white">R$ {Number(os.total || 0).toFixed(2)}</td>
                      
                      {/* ✏️ Input Inline de Custo com Autosave no Blur/Enter */}
                      <td className="p-3.5">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="0.01"
                            value={custoAtual}
                            onChange={e => setCustosLocais({ ...custosLocais, [os.id]: e.target.value })}
                            onBlur={() => handleSalvarCusto(os.id, custosLocais[os.id])}
                            onKeyDown={e => e.key === 'Enter' && handleSalvarCusto(os.id, custosLocais[os.id])}
                            className="w-24 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 focus:border-red-500 rounded-lg px-2 py-1 text-xs text-rose-400 font-bold outline-none transition"
                            placeholder="0.00"
                          />
                          {salvandoCustoId === os.id && (
                            <Loader2 className="w-3 h-3 text-red-500 animate-spin absolute right-2" />
                          )}
                        </div>
                      </td>

                      {/* 💰 Lucro Real Calculado */}
                      <td className="p-3.5 font-black text-emerald-400">
                        R$ {lucroCalc.toFixed(2)}
                      </td>

                      <td className="p-3.5">
                        <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md text-[10px] font-medium border border-zinc-700">
                          {os.forma_pagamento || 'N/A'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleVerPedido(os)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition border border-zinc-700"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" /> Ver Pedido
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 🔢 Paginação */}
        {!loadingOrdens && dadosOrdens.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-zinc-400">
            <div className="text-center sm:text-left">
              Página <span className="font-bold text-white">{dadosOrdens.pagina}</span> de{' '}
              <span className="font-bold text-white">{dadosOrdens.total_paginas}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => carregarOrdens(dadosOrdens.pagina - 1)}
                disabled={dadosOrdens.pagina <= 1}
                className="px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-white transition flex items-center gap-1 font-bold text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <button
                onClick={() => carregarOrdens(dadosOrdens.pagina + 1)}
                disabled={dadosOrdens.pagina >= dadosOrdens.total_paginas}
                className="px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 disabled:opacity-30 text-white transition flex items-center gap-1 font-bold text-xs"
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