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
  Tag
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import MetricCard from '../components/MetricCard';

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
  const totalRecebido = Number(dadosEstatisticas?.total_recebido || 0);
  const totalAReceber = Number(dadosEstatisticas?.total_a_receber || 0);
  const totalOrdens = Number(dadosEstatisticas?.total_ordens || 0);
  const totalMaoObra = Number(dadosEstatisticas?.total_mao_obra || 0);
  const custoTotal = Number(dadosEstatisticas?.custo_total || 0);
  const lucroReal = Number(dadosEstatisticas?.lucro_real || 0);
  const margemLucro = Number(dadosEstatisticas?.margem_lucro || 0);
  const totalDescontos = Number(dadosEstatisticas?.total_descontos || 0);
  const ordensComDesconto = Number(dadosEstatisticas?.ordens_com_desconto || 0);

  const formasPagamento = Array.isArray(dadosEstatisticas?.formas_pagamento) ? dadosEstatisticas.formas_pagamento : [];
  const topServicos = Array.isArray(dadosEstatisticas?.top_servicos) ? dadosEstatisticas.top_servicos : [];
  const pendencias = Array.isArray(dadosEstatisticas?.pendencias) ? dadosEstatisticas.pendencias : [];

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
          {/* 📊 Painel de Métricas (7 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">

            <MetricCard
              label="Faturado"
              icon={DollarSign}
              iconClass="text-blue-500"
              value={`R$ ${faturamentoTotal.toFixed(2)}`}
              subtitle={`${totalOrdens} OS no período`}
            />

            <MetricCard
              label="Em Caixa"
              labelClass="text-emerald-600 dark:text-emerald-400"
              icon={CreditCard}
              iconClass="text-emerald-500"
              value={`R$ ${totalRecebido.toFixed(2)}`}
              valueClass="text-emerald-600 dark:text-emerald-400"
              subtitle="Total já liquidado"
            />

            <MetricCard
              label="A Receber"
              labelClass="text-amber-500"
              icon={Clock}
              iconClass="text-amber-500"
              value={`R$ ${totalAReceber.toFixed(2)}`}
              valueClass="text-amber-500"
              borderClass="border-amber-500/30 dark:border-amber-500/40"
              subtitle={`${pendencias.length} saldo(s) pendente(s)`}
            />

            <MetricCard
              label="Custos"
              icon={ArrowDownRight}
              iconClass="text-rose-500"
              value={`R$ ${custoTotal.toFixed(2)}`}
              valueClass="text-rose-600 dark:text-rose-400"
              subtitle="Peças e despesas"
            />

            {/* 🏷️ Card de Descontos — NOVO */}
            <MetricCard
              label="Descontos"
              icon={Tag}
              iconClass="text-orange-500"
              value={`R$ ${totalDescontos.toFixed(2)}`}
              valueClass="text-orange-500 dark:text-orange-400"
              borderClass="border-orange-500/30 dark:border-orange-500/40"
              bgClass="bg-orange-500/5 dark:bg-orange-500/5 dark:bg-zinc-900"
              subtitle={`${ordensComDesconto} OS com desconto`}
              subtitleClass="text-orange-600/70 dark:text-orange-500/70"
            />

            {/* Lucro Real em Caixa */}
            <MetricCard
              label="Lucro Real"
              labelClass="text-emerald-600 dark:text-emerald-400"
              value={`R$ ${lucroReal.toFixed(2)}`}
              valueClass="text-emerald-600 dark:text-emerald-400"
              borderClass="border-emerald-500/30 dark:border-emerald-500/40"
              bgClass="bg-emerald-500/10"
              subtitleClass="text-emerald-600 dark:text-emerald-500/80 font-medium"
              subtitle="Caixa Líquido"
              badge={
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full flex items-center">
                  <Percent className="w-2.5 h-2.5" /> {margemLucro.toFixed(0)}%
                </span>
              }
            />

            <MetricCard
              label="Mão de Obra"
              icon={Wrench}
              iconClass="text-purple-500"
              value={`R$ ${totalMaoObra.toFixed(2)}`}
              valueClass="text-purple-600 dark:text-purple-400"
              subtitle="Total de serviços"
            />

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
                  Total Pendente: R$ {totalAReceber.toFixed(2)}
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
                        Falta R$ {Number(p.restante || 0).toFixed(2)}
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
                          R$ {Number(item.valor || 0).toFixed(2)}
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