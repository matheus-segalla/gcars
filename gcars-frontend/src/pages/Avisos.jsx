import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Trash2,
  MessageSquare,
  Car,
  User,
  Phone,
  Sparkles,
  X,
  Loader2,
  Filter,
  Check,
  CalendarPlus,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

// Sugestões de serviços frequentes para preenchimento com 1 clique
const SUGESTOES_SERVICOS = [
  { label: 'Troca de Óleo e Filtros', meses: 6, icone: '🛢️' },
  { label: 'Revisão de Freios / Pastilhas', meses: 12, icone: '🛑' },
  { label: 'Alinhamento & Balanceamento', meses: 6, icone: '📐' },
  { label: 'Revisão Geral Preventiva', meses: 12, icone: '🔍' },
  { label: 'Troca de Correia Dentada', meses: 48, icone: '⚙️' },
  { label: 'Líquido de Arrefecimento', meses: 12, icone: '❄️' },
];

// Atalhos rápidos de prazo
const ATALHOS_PRAZO = [
  { label: '+30 dias (1 mês)', dias: 30 },
  { label: '+60 dias (2 meses)', dias: 60 },
  { label: '+90 dias (3 meses)', dias: 90 },
  { label: '+6 meses (Recomendado)', meses: 6 },
  { label: '+7 meses', meses: 7 },
  { label: '+8 meses', meses: 8 },
  { label: '+1 ano (12 meses)', meses: 12 },
  { label: '+4 anos (48 meses)', meses: 48 },
];

// Calcula data ISO (YYYY-MM-DD) relativa a hoje
function calcularDataRelativa(meses = 0, dias = 0) {
  const d = new Date();
  if (meses) {
    d.setMonth(d.getMonth() + meses);
  }
  if (dias) {
    d.setDate(d.getDate() + dias);
  }
  return d.toISOString().split('T')[0];
}

// Formata data YYYY-MM-DD para DD/MM/AAAA
function formatarDataBR(dataStr) {
  if (!dataStr) return '';
  try {
    const [ano, mes, dia] = dataStr.slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  } catch {
    return dataStr;
  }
}

// Formata data por extenso (ex: "Sexta, 10 de Outubro de 2026")
function formatarDataExtenso(dataStr) {
  if (!dataStr) return '';
  try {
    const [ano, mes, dia] = dataStr.slice(0, 10).split('-').map(Number);
    const d = new Date(ano, mes - 1, dia);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dataStr;
  }
}

// Gera link amigável de WhatsApp
function criarLinkWhatsApp(telefone, cliente, veiculo, servico) {
  if (!telefone) return null;
  const limpo = telefone.replace(/\D/g, '');
  if (!limpo) return null;
  const num = limpo.length <= 11 ? `55${limpo}` : limpo;
  const saudacaoCliente = cliente ? `Olá ${cliente.trim()}!` : 'Olá!';
  const carroTexto = veiculo ? ` no veículo *${veiculo.trim()}*` : '';
  const msg = encodeURIComponent(
    `${saudacaoCliente} Tudo bem? Aqui é da oficina *G CARS*.\n\n` +
    `Estamos entrando em contato para avisar que está no período recomendado para realizar a *${servico}*${carroTexto}.\n\n` +
    `Gostaria de agendar um horário com a gente para garantir a segurança e o bom funcionamento do seu carro?`
  );
  return `https://wa.me/${num}?text=${msg}`;
}

export default function Avisos() {
  const { showToast, showConfirm } = useNotification();

  const [lembretes, setLembretes] = useState([]);
  const [contadores, setContadores] = useState({
    total_pendentes: 0,
    vencidos: 0,
    hoje: 0,
    proximos_7_dias: 0,
    proximos_30_dias: 0,
    concluidos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroAba, setFiltroAba] = useState('pendentes'); // 'pendentes' | 'vencidos' | 'proximos' | 'futuros' | 'concluidos' | 'todos'

  // Modal de Criação / Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    id: null,
    titulo: '',
    cliente_nome: '',
    cliente_telefone: '',
    veiculo_info: '',
    data_lembrete: calcularDataRelativa(6), // padrão: daqui a 6 meses
    observacoes: '',
  });

  // Modal rápido de Reagendamento
  const [reagendandoItem, setReagendandoItem] = useState(null);
  const [novaDataReagendamento, setNovaDataReagendamento] = useState('');

  // Carrega lista de lembretes e contadores
  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resLista, resCont] = await Promise.all([
        api.get('/api/lembretes'),
        api.get('/api/lembretes/contadores'),
      ]);
      setLembretes(resLista.data || []);
      setContadores(resCont.data || {});
    } catch (err) {
      console.error('Erro ao carregar lembretes:', err);
      showToast('Erro ao carregar lembretes.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Abrir modal para novo lembrete
  const handleNovoLembrete = () => {
    setForm({
      id: null,
      titulo: '',
      cliente_nome: '',
      cliente_telefone: '',
      veiculo_info: '',
      data_lembrete: calcularDataRelativa(6),
      observacoes: '',
    });
    setModalAberto(true);
  };

  // Abrir modal para editar lembrete
  const handleEditarLembrete = (item) => {
    setForm({
      id: item.id,
      titulo: item.titulo,
      cliente_nome: item.cliente_nome,
      cliente_telefone: item.cliente_telefone,
      veiculo_info: item.veiculo_info,
      data_lembrete: item.data_lembrete,
      observacoes: item.observacoes,
    });
    setModalAberto(true);
  };

  // Salvar lembrete (novo ou edição)
  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      return showToast('Informe o título ou serviço do lembrete.', 'aviso');
    }
    if (!form.data_lembrete) {
      return showToast('Escolha a data do lembrete.', 'aviso');
    }

    setSalvando(true);
    try {
      if (form.id) {
        await api.put(`/api/lembretes/${form.id}`, form);
        showToast('Lembrete atualizado com sucesso!', 'sucesso');
      } else {
        await api.post('/api/lembretes', form);
        showToast('Novo lembrete cadastrado com sucesso!', 'sucesso');
      }
      setModalAberto(false);
      carregarDados();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Erro ao salvar lembrete.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  // Concluir lembrete (dar baixa)
  const handleConcluir = async (item) => {
    try {
      await api.patch(`/api/lembretes/${item.id}/concluir`);
      showToast(`Lembrete "${item.titulo}" concluído!`, 'sucesso');
      carregarDados();
    } catch (err) {
      showToast('Erro ao concluir lembrete.', 'erro');
    }
  };

  // Reabrir lembrete concluído
  const handleReabrir = async (item) => {
    try {
      await api.patch(`/api/lembretes/${item.id}/reabrir`);
      showToast(`Lembrete reaberto com sucesso!`, 'sucesso');
      carregarDados();
    } catch (err) {
      showToast('Erro ao reabrir lembrete.', 'erro');
    }
  };

  // Reagendar data
  const handleConfirmarReagendamento = async (item, dataEscolhida) => {
    if (!dataEscolhida) return;
    try {
      await api.patch(`/api/lembretes/${item.id}/reagendar`, {
        nova_data: dataEscolhida,
      });
      showToast(`Lembrete reagendado para ${formatarDataBR(dataEscolhida)}!`, 'sucesso');
      setReagendandoItem(null);
      carregarDados();
    } catch (err) {
      showToast('Erro ao reagendar lembrete.', 'erro');
    }
  };

  // Excluir lembrete
  const handleExcluir = (item) => {
    showConfirm({
      titulo: 'Excluir Lembrete?',
      mensagem: `Deseja realmente excluir o lembrete "${item.titulo}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, Excluir',
      isDanger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/api/lembretes/${item.id}`);
          showToast('Lembrete excluído com sucesso.', 'sucesso');
          carregarDados();
        } catch (err) {
          showToast('Erro ao excluir lembrete.', 'erro');
        }
      },
    });
  };

  // Filtragem dos lembretes em memória (super rápida)
  const lembretesFiltrados = useMemo(() => {
    return lembretes.filter((item) => {
      // Filtro textual
      if (busca.trim()) {
        const termo = busca.toLowerCase().trim();
        const textoCompleto = `${item.titulo} ${item.cliente_nome} ${item.cliente_telefone} ${item.veiculo_info} ${item.observacoes}`.toLowerCase();
        if (!textoCompleto.includes(termo)) return false;
      }

      // Filtro por abas
      if (filtroAba === 'pendentes') return item.status === 'pendente';
      if (filtroAba === 'vencidos') return item.status === 'pendente' && item.urgencia === 'vencido';
      if (filtroAba === 'proximos') return item.status === 'pendente' && (item.urgencia === 'hoje' || item.urgencia === 'urgente' || item.urgencia === 'breve');
      if (filtroAba === 'futuros') return item.status === 'pendente' && item.urgencia === 'futuro';
      if (filtroAba === 'concluidos') return item.status === 'concluido';
      return true; // 'todos'
    });
  }, [lembretes, busca, filtroAba]);

  return (
    <div className="space-y-6">

      {/* 🧭 Topo: Cabeçalho & Botão de Criação */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-600/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 rounded-xl">
              <Bell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                Avisos & Lembretes
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Acompanhe trocas de óleo, revisões e serviços periódicos dos veículos
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNovoLembrete}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Lembrete</span>
        </button>
      </div>

      {/* 📊 Mini-KPIs de Urgência */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Vencidos */}
        <div
          onClick={() => setFiltroAba('vencidos')}
          className={`cursor-pointer bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all hover:scale-[1.02] shadow-md ${
            filtroAba === 'vencidos'
              ? 'border-red-500 ring-2 ring-red-500/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400 mb-1">
            <span className="uppercase tracking-wider text-[10px]">Vencidos</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">
            {contadores.vencidos || 0}
          </p>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Necessitam contato</span>
        </div>

        {/* Próximos 30 dias */}
        <div
          onClick={() => setFiltroAba('proximos')}
          className={`cursor-pointer bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all hover:scale-[1.02] shadow-md ${
            filtroAba === 'proximos'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-500 mb-1">
            <span className="uppercase tracking-wider text-[10px]">Próximos 30 dias</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-500">
            {contadores.proximos_30_dias || 0}
          </p>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Vencendo em breve</span>
        </div>

        {/* Futuros */}
        <div
          onClick={() => setFiltroAba('futuros')}
          className={`cursor-pointer bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all hover:scale-[1.02] shadow-md ${
            filtroAba === 'futuros'
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-500 mb-1">
            <span className="uppercase tracking-wider text-[10px]">Futuros (+30 dias)</span>
            <Calendar className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-blue-500">
            {Math.max(0, (contadores.total_pendentes || 0) - (contadores.vencidos || 0) - (contadores.proximos_30_dias || 0))}
          </p>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Agendados adiante</span>
        </div>

        {/* Concluídos */}
        <div
          onClick={() => setFiltroAba('concluidos')}
          className={`cursor-pointer bg-white dark:bg-zinc-900 border rounded-2xl p-4 transition-all hover:scale-[1.02] shadow-md ${
            filtroAba === 'concluidos'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-500 mb-1">
            <span className="uppercase tracking-wider text-[10px]">Concluídos</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-500">
            {contadores.concluidos || 0}
          </p>
          <span className="text-[10px] text-zinc-400 block mt-0.5">Baixa efetuada</span>
        </div>

      </div>

      {/* 🔍 Barra de Busca & Abas de Filtro */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xl transition-colors">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, veículo, placa ou serviço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-red-500 transition"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Abas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'pendentes', label: `Todos Pendentes (${contadores.total_pendentes || 0})` },
            { id: 'vencidos', label: `Vencidos (${contadores.vencidos || 0})` },
            { id: 'proximos', label: `Próximos 30 dias (${contadores.proximos_30_dias || 0})` },
            { id: 'futuros', label: 'Futuros' },
            { id: 'concluidos', label: `Concluídos (${contadores.concluidos || 0})` },
            { id: 'todos', label: 'Todos' },
          ].map((aba) => (
            <button
              key={aba.id}
              onClick={() => setFiltroAba(aba.id)}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[11px] whitespace-nowrap transition ${
                filtroAba === aba.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Lista de Lembretes */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Carregando avisos e lembretes...
          </span>
        </div>
      ) : lembretesFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Nenhum lembrete encontrado
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {busca
              ? 'Nenhum resultado corresponde à sua pesquisa. Tente outros termos.'
              : 'Não há lembretes nesta categoria. Cadastre um novo lembrete para começar a acompanhar revisões periódicas!'}
          </p>
          {!busca && (
            <button
              type="button"
              onClick={handleNovoLembrete}
              className="mt-2 inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Cadastrar Primeiro Lembrete
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lembretesFiltrados.map((item) => {
            const isConcluido = item.status === 'concluido';
            const linkWhats = criarLinkWhatsApp(
              item.cliente_telefone,
              item.cliente_nome,
              item.veiculo_info,
              item.titulo
            );

            // Badge de tempo / urgência
            let badgeTexto = '';
            let badgeEstilo = '';
            if (isConcluido) {
              badgeTexto = 'Concluído';
              badgeEstilo = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700';
            } else if (item.dias_diferenca < 0) {
              const dias = Math.abs(item.dias_diferenca);
              badgeTexto = `Vencido há ${dias} dia${dias > 1 ? 's' : ''}`;
              badgeEstilo = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
            } else if (item.dias_diferenca === 0) {
              badgeTexto = 'Vence Hoje!';
              badgeEstilo = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 animate-pulse';
            } else if (item.dias_diferenca <= 7) {
              badgeTexto = `Vence em ${item.dias_diferenca} dias`;
              badgeEstilo = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
            } else if (item.dias_diferenca <= 30) {
              badgeTexto = `Vence em ${item.dias_diferenca} dias`;
              badgeEstilo = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
            } else {
              const mesesAprox = Math.round(item.dias_diferenca / 30);
              badgeTexto = `Em ~${mesesAprox} meses (${formatarDataBR(item.data_lembrete)})`;
              badgeEstilo = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
            }

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 space-y-4 shadow-xl transition-all relative overflow-hidden ${
                  isConcluido
                    ? 'border-zinc-200 dark:border-zinc-800 opacity-60'
                    : item.urgencia === 'vencido'
                    ? 'border-red-500/50 hover:border-red-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Linha 1: Título e Badge de Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className={`text-base font-black truncate ${
                      isConcluido ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'
                    }`}>
                      {item.titulo}
                    </h3>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block mt-0.5">
                      Previsto para: <strong className="text-zinc-700 dark:text-zinc-200">{formatarDataExtenso(item.data_lembrete)}</strong>
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${badgeEstilo}`}>
                    {badgeTexto}
                  </span>
                </div>

                {/* Linha 2: Cliente & Veículo */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3 text-red-500" /> Cliente
                    </span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-200 truncate">
                      {item.cliente_nome || 'Não informado'}
                    </p>
                    {item.cliente_telefone && (
                      <span className="text-[11px] text-zinc-500 font-mono block">
                        {item.cliente_telefone}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Car className="w-3 h-3 text-red-500" /> Veículo / Placa
                    </span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-200 truncate">
                      {item.veiculo_info || 'Não informado'}
                    </p>
                  </div>
                </div>

                {/* Observações (se houver) */}
                {item.observacoes && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic bg-zinc-50/50 dark:bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 leading-relaxed">
                    "{item.observacoes}"
                  </p>
                )}

                {/* Linha 3: Barra de Ações */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap text-xs">
                  
                  {/* WhatsApp (se tiver telefone) */}
                  {linkWhats ? (
                    <a
                      href={linkWhats}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-sm active:scale-95"
                      title="Enviar mensagem automática no WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-zinc-400 italic">Sem telefone cadastrado</span>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {/* Botão de Concluir / Reabrir */}
                    {isConcluido ? (
                      <button
                        type="button"
                        onClick={() => handleReabrir(item)}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] transition flex items-center gap-1"
                        title="Reabrir este lembrete"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reabrir</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConcluir(item)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-[11px] transition flex items-center gap-1"
                        title="Marcar como concluído / serviço realizado"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Concluir</span>
                      </button>
                    )}

                    {/* Botão Reagendar */}
                    <button
                      type="button"
                      onClick={() => {
                        setReagendandoItem(item);
                        setNovaDataReagendamento(item.data_lembrete);
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 transition"
                      title="Reagendar prazo"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>

                    {/* Botão Editar */}
                    <button
                      type="button"
                      onClick={() => handleEditarLembrete(item)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      title="Editar detalhes"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Botão Excluir */}
                    <button
                      type="button"
                      onClick={() => handleExcluir(item)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition"
                      title="Excluir lembrete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 📝 Modal de Cadastro / Edição de Lembrete */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#121417] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl text-zinc-900 dark:text-white max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121417] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 text-white">
                  <Bell className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-wide uppercase">
                    {form.id ? 'Editar Lembrete' : 'Novo Lembrete Interno'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Defina o serviço e o prazo que o sistema deve avisar
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1.5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário com rolagem */}
            <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
              
              {/* Título / Serviço */}
              <div>
                <label className="text-zinc-700 dark:text-zinc-300 mb-1 block font-bold">
                  Serviço a ser realizado *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Troca de Óleo e Filtro de Combustível"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white outline-none focus:border-red-500 font-semibold"
                  required
                />

                {/* Sugestões Rápidas de Serviços */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                    Sugestões rápidas (clique para preencher):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGESTOES_SERVICOS.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            titulo: sug.label,
                            data_lembrete: calcularDataRelativa(sug.meses),
                          });
                        }}
                        className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-[10px] font-medium transition border border-zinc-200 dark:border-zinc-700 flex items-center gap-1"
                      >
                        <span>{sug.icone}</span>
                        <span>{sug.label}</span>
                        <span className="opacity-60 text-[9px]">
                          ({sug.meses >= 12 && sug.meses % 12 === 0 ? `${sug.meses / 12} ano${sug.meses > 12 ? 's' : ''}` : `${sug.meses}m`})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cliente & Veículo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-700 dark:text-zinc-300 mb-1 block font-medium flex items-center gap-1">
                    <User className="w-3 h-3 text-red-500" /> Nome do Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Mecânico / Maria"
                    value={form.cliente_nome}
                    onChange={(e) => setForm({ ...form, cliente_nome: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 dark:text-zinc-300 mb-1 block font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-500" /> WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 98765-4321"
                    value={form.cliente_telefone}
                    onChange={(e) => setForm({ ...form, cliente_telefone: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-700 dark:text-zinc-300 mb-1 block font-medium flex items-center gap-1">
                  <Car className="w-3 h-3 text-red-500" /> Veículo / Modelo / Placa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Honda Civic 2018 - ABC-1D23"
                  value={form.veiculo_info}
                  onChange={(e) => setForm({ ...form, veiculo_info: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-red-500"
                />
              </div>

              {/* 📅 PRAZO VERSÁTIL: Atalhos Rápidos + Seletor Livre */}
              <div className="bg-zinc-50 dark:bg-zinc-950/80 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-red-500" /> Quando você quer ser lembrado? *
                  </label>
                  <span className="text-[10px] text-zinc-400">Escolha o prazo</span>
                </div>

                {/* Botões de Atalhos de Prazo */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {ATALHOS_PRAZO.map((at, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const nova = at.meses
                          ? calcularDataRelativa(at.meses, 0)
                          : calcularDataRelativa(0, at.dias);
                        setForm({ ...form, data_lembrete: nova });
                      }}
                      className="px-2.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-500 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] transition text-center active:scale-95 shadow-xs"
                    >
                      {at.label}
                    </button>
                  ))}
                </div>

                {/* Seletor Livre de Data */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">
                      Data exata do lembrete:
                    </label>
                    <input
                      type="date"
                      value={form.data_lembrete}
                      onChange={(e) => setForm({ ...form, data_lembrete: e.target.value })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-red-500 font-bold cursor-pointer"
                      required
                    />
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px]">
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Data selecionada:</span>
                    <strong className="text-zinc-900 dark:text-white text-xs block mt-0.5">
                      {formatarDataExtenso(form.data_lembrete)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-zinc-700 dark:text-zinc-300 mb-1 block font-medium">
                  Observações internas (opcional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Ex: Cliente prefere contato após as 14h. Avisar que precisa verificar filtro de cabine também."
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none focus:border-red-500 leading-relaxed"
                />
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-200 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {salvando ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    form.id ? 'Salvar Alterações' : 'Criar Lembrete'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ⏰ Modal Rápido de Reagendamento */}
      {reagendandoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-blue-500" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Reagendar Lembrete
                </h4>
              </div>
              <button
                onClick={() => setReagendandoItem(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400">
              Escolha uma nova data para o lembrete de <strong className="text-zinc-900 dark:text-white">{reagendandoItem.titulo}</strong>:
            </p>

            {/* Atalhos rápidos */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleConfirmarReagendamento(reagendandoItem, calcularDataRelativa(0, 30))}
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500/10 hover:text-blue-600 font-bold transition text-center"
              >
                + 30 dias
              </button>
              <button
                type="button"
                onClick={() => handleConfirmarReagendamento(reagendandoItem, calcularDataRelativa(6, 0))}
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500/10 hover:text-blue-600 font-bold transition text-center"
              >
                + 6 meses
              </button>
              <button
                type="button"
                onClick={() => handleConfirmarReagendamento(reagendandoItem, calcularDataRelativa(12, 0))}
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-500/10 hover:text-blue-600 font-bold transition text-center"
              >
                + 1 ano
              </button>
            </div>

            {/* Data personalizada */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="text-[10px] text-zinc-500 font-bold uppercase block">
                Ou selecione a data desejada:
              </label>
              <input
                type="date"
                value={novaDataReagendamento}
                onChange={(e) => setNovaDataReagendamento(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-900 dark:text-white outline-none font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReagendandoItem(null)}
                className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmarReagendamento(reagendandoItem, novaDataReagendamento)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Confirmar Reagendamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
