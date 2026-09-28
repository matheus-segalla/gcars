import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Wrench,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
  Award,
  Percent,
  ArrowDownRight,
  Clock,
  Tag,
  Calculator,
  Receipt,
  TrendingUp,
  Wallet,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const formatarMoeda = (valor) => {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export default function Relatorios() {
  const { showToast } = useNotification();

  const [periodo, setPeriodo] = useState('mes');
  const [dadosEstatisticas, setDadosEstatisticas] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [erroStats, setErroStats] = useState(false);

  const carregarEstatisticas = async (p = periodo) => {
    setLoadingStats(true);
    setErroStats(false);
    try {
      const res = await api.get(`/api/relatorios/estatisticas?periodo=${p}`);
      setDadosEstatisticas(res.data);
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      setErroStats(true);
      showToast('Erro ao carregar os dados consolidados.', 'erro');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    carregarEstatisticas(periodo);
  }, [periodo]);

  // Extração segura dos dados calculados
  const faturamentoTotal = Number(dadosEstatisticas?.faturamento_total || 0);
  const totalDescontos = Number(dadosEstatisticas?.total_descontos || 0);
  const totalVendasBruto = Number(
    dadosEstatisticas?.total_vendas_bruto ?? (faturamentoTotal + totalDescontos)
  );
  const totalRecebido = Number(dadosEstatisticas?.total_recebido || 0);
  const totalAReceber = Number(dadosEstatisticas?.total_a_receber || 0);
  const totalOrdens = Number(dadosEstatisticas?.total_ordens || 0);
  const totalMaoObra = Number(dadosEstatisticas?.total_mao_obra || 0);
  const totalPecas = Number(dadosEstatisticas?.total_pecas || 0);
  const custoTotal = Number(dadosEstatisticas?.custo_total || 0);
  const lucroReal = Number(dadosEstatisticas?.lucro_real || 0);
  const margemLucro = Number(dadosEstatisticas?.margem_lucro || 0);
  const ticketMedio = Number(dadosEstatisticas?.ticket_medio || 0);
  const ordensComDesconto = Number(dadosEstatisticas?.ordens_com_desconto || 0);

  const formasPagamento = Array.isArray(dadosEstatisticas?.formas_pagamento) ? dadosEstatisticas.formas_pagamento : [];
  const topServicos = Array.isArray(dadosEstatisticas?.top_servicos) ? dadosEstatisticas.top_servicos : [];
  const pendencias = Array.isArray(dadosEstatisticas?.pendencias) ? dadosEstatisticas.pendencias : [];

  const percRecebido = faturamentoTotal > 0
    ? Math.min(100, Math.round((totalRecebido / faturamentoTotal) * 100))
    : 100;

  return (
    <div className="space-y-8">

      {/* 🧭 Seletor de Período */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-300">
          <Calendar className="w-5 h-5 text-red-500" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Período de Análise</span>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto">
          {[
            { id: 'semana', label: 'Esta Semana' },
            { id: 'mes', label: 'Este Mês' },
            { id: 'ano', label: 'Este Ano' },
            { id: 'geral', label: 'Histórico Geral' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition uppercase tracking-wider ${periodo === p.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {erroStats && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Não foi possível carregar as estatísticas. Verifique se o backend está ativo.</span>
        </div>
      )}

      {loadingStats ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Calculando métricas financeiras...
          </span>
        </div>
      ) : (
        <>
          {/* 🌟 3 Grandes Indicadores Mestres (Visão Executiva) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* 1. Lucro Real no Caixa (Destaque Principal) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white dark:to-zinc-900 border-2 border-emerald-500/40 dark:border-emerald-500/50 rounded-2xl p-5 shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Lucro Real em Caixa
                  </span>
                </div>
                <span className="text-[11px] font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Percent className="w-3 h-3 stroke-[3]" /> {margemLucro.toFixed(0)}% margem
                </span>
              </div>

              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatarMoeda(lucroReal)}
              </p>

              <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Recebido no caixa:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{formatarMoeda(totalRecebido)}</span>
                </div>
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span>(−) Custo das peças:</span>
                  <span className="font-bold">− {formatarMoeda(custoTotal)}</span>
                </div>
              </div>
            </div>

            {/* 2. Faturamento da Oficina */}
            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white dark:to-zinc-900 border border-blue-500/30 dark:border-blue-500/40 rounded-2xl p-5 shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                    <DollarSign className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Faturamento Líquido
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-md">
                  {totalOrdens} OS no período
                </span>
              </div>

              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {formatarMoeda(faturamentoTotal)}
              </p>

              <div className="mt-3 pt-3 border-t border-blue-500/20 text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Venda Bruta (Total):</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{formatarMoeda(totalVendasBruto)}</span>
                </div>
                <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
                  <span>(−) Descontos concedidos:</span>
                  <span className="font-bold">− {formatarMoeda(totalDescontos)}</span>
                </div>
              </div>
            </div>

            {/* 3. Situação do Caixa / Recebimento */}
            <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-white dark:to-zinc-900 border border-purple-500/30 dark:border-purple-500/40 rounded-2xl p-5 shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-400">
                    <Wallet className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    Dinheiro em Caixa
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md">
                  {percRecebido}% liquidado
                </span>
              </div>

              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                {formatarMoeda(totalRecebido)}
              </p>

              <div className="mt-3 pt-3 border-t border-purple-500/20 text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Saldo a receber:</span>
                  <span className={`font-bold ${totalAReceber > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {totalAReceber > 0 ? formatarMoeda(totalAReceber) : 'Tudo quitado ✓'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span>Pendências de clientes:</span>
                  <span className="font-semibold">{pendencias.length} ordem(ns)</span>
                </div>
              </div>
            </div>

          </div>

          {/* 🧮 Painel Explicativo: Fluxo Financeiro & DRE da Oficina */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl transition-colors">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    Fluxo Financeiro & Apuração do Lucro
                  </h3>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Veja passo a passo como o valor bruto das vendas se transforma no lucro da oficina
                </p>
              </div>

              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg self-start sm:self-auto">
                DRE Operacional
              </span>
            </div>

            {/* Passo a Passo em Linha Conectada */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
              
              {/* Passo 1: Venda Bruta */}
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-1">
                    <span>1. Venda Bruta</span>
                    <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                    {formatarMoeda(totalVendasBruto)}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 block">
                  Peças + Mão de Obra
                </span>
              </div>

              {/* Passo 2: Descontos */}
              <div className="bg-orange-500/5 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider mb-1">
                    <span>2. Descontos</span>
                    <Tag className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <p className="text-lg sm:text-xl font-black text-orange-600 dark:text-orange-400">
                    − {formatarMoeda(totalDescontos)}
                  </p>
                </div>
                <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80 mt-2 pt-2 border-t border-orange-500/20 block font-medium">
                  {ordensComDesconto} OS com desconto
                </span>
              </div>

              {/* Passo 3: Faturado Líquido */}
              <div className="bg-blue-500/5 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">
                    <span>3. Venda Líquida</span>
                    <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <p className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400">
                    = {formatarMoeda(faturamentoTotal)}
                  </p>
                </div>
                <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-2 pt-2 border-t border-blue-500/20 block font-medium">
                  Valor final das ordens
                </span>
              </div>

              {/* Passo 4: Custo das Peças */}
              <div className="bg-rose-500/5 dark:bg-rose-500/10 p-4 rounded-xl border border-rose-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider mb-1">
                    <span>4. Custo Peças</span>
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <p className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
                    − {formatarMoeda(custoTotal)}
                  </p>
                </div>
                <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-2 pt-2 border-t border-rose-500/20 block font-medium">
                  Gasto em autopeças
                </span>
              </div>

              {/* Passo 5: Lucro Final */}
              <div className="bg-emerald-500/15 dark:bg-emerald-500/20 p-4 rounded-xl border-2 border-emerald-500/50 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-black uppercase tracking-wider mb-1">
                    <span>5. Lucro Real</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                    = {formatarMoeda(lucroReal)}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-2 pt-2 border-t border-emerald-500/30 block font-bold">
                  {margemLucro.toFixed(0)}% margem líquida
                </span>
              </div>

            </div>

            {/* Detalhamento da Produção da Oficina */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      Mão de Obra (Serviços)
                    </span>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {formatarMoeda(totalMaoObra)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                  100% oficina
                </span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      Peças Vendidas
                    </span>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {formatarMoeda(totalPecas)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  Custo: {formatarMoeda(custoTotal)}
                </span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-600 dark:text-zinc-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                      Ticket Médio por OS
                    </span>
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {formatarMoeda(ticketMedio)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  {totalOrdens} ordens
                </span>
              </div>

            </div>

          </div>

          {/* ⚠️ Painel de Cobrança / Contas a Receber */}
          {pendencias.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-amber-500/30 dark:border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                    Contas a Receber & Pendências ({pendencias.length})
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Total Pendente: {formatarMoeda(totalAReceber)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendencias.map(p => (
                  <div key={p.id} className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400">Talão #{p.numero_orcamento}</span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{p.cliente}</h4>
                      </div>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Falta {formatarMoeda(p.restante)}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800/60">
                      <span className="truncate pr-2">{p.veiculo}</span>
                      <span className="shrink-0">{p.data}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 💳 Formas de Pagamento & 🔧 Ranking de Serviços */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Formas de Pagamento */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-500" /> Formas de Pagamento
                </h3>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{formasPagamento.length} métodos</span>
              </div>

              {formasPagamento.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Nenhum pagamento registrado no período.</p>
              ) : (
                <div className="space-y-3">
                  {formasPagamento.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-700 dark:text-zinc-300">{item.metodo}</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {formatarMoeda(item.valor)}
                          <span className="text-zinc-500 font-normal ml-1">({Number(item.percentual || 0).toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-200 dark:border-zinc-800">
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

            {/* Ranking de Serviços */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Serviços Mais Frequentes
                </h3>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Top ocorrências</span>
              </div>

              {topServicos.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Nenhum serviço registrado no período.</p>
              ) : (
                <div className="space-y-2.5">
                  {topServicos.map((serv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/80 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 flex items-center justify-center font-bold text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate">{serv.descricao}</span>
                      </div>
                      <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-bold text-[11px] flex-shrink-0">
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

    </div>
  );
}