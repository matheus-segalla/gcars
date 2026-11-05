import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  DollarSign,
  CheckCircle2,
  Loader2,
  UserCheck,
  Car,
  Calendar,
  Wrench,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
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

export default function ModalEditarOS({ isOpen, os, onClose, onSaved }) {
  if (!isOpen || !os) return null;

  const { showToast } = useNotification();
  const [salvando, setSalvando] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);

  // Estado do formulário de edição
  const [form, setForm] = useState({
    numero: os.numero_orcamento || '',
    data: os.data || '',
    cliente: os.cliente || '',
    telefone: os.telefone || '',
    veiculo: os.veiculo_modelo || (typeof os.veiculo === 'string' ? os.veiculo.replace(/\s*\(.*?\)/, '') : '') || '',
    placa: os.placa || '',
    cor: os.cor || '',
    ano: os.ano || '',
    km: os.km || '',
    funcionario_id: os.funcionario_id || '',
    forma_pagamento: os.forma_pagamento || '',
    pecas: os.pecas !== undefined ? os.pecas : 0,
    mao_obra: os.mao_obra !== undefined ? os.mao_obra : 0,
    desconto: os.desconto !== undefined ? os.desconto : 0,
    valor_pago: os.valor_pago !== undefined ? os.valor_pago : 0,
    custo: os.custo !== undefined ? os.custo : 0,
    servicos: Array.isArray(os.servicos) ? os.servicos.join('\n') : (typeof os.servicos === 'string' ? os.servicos : ''),
    fotos: Array.isArray(os.fotos) ? os.fotos : []
  });

  // Carrega mecânicos ativos
  useEffect(() => {
    async function carregarFuncionarios() {
      try {
        const res = await api.get('/api/funcionarios?apenas_ativos=true');
        setFuncionarios(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar funcionários:', err);
      }
    }
    carregarFuncionarios();
  }, []);

  // Atualiza form se a prop os mudar
  useEffect(() => {
    if (os) {
      let fotosArray = [];
      if (Array.isArray(os.fotos)) {
        fotosArray = os.fotos;
      } else if (typeof os.fotos_json === 'string' && os.fotos_json.trim()) {
        try {
          fotosArray = JSON.parse(os.fotos_json);
        } catch {
          fotosArray = [];
        }
      }

      setForm({
        numero: os.numero_orcamento || '',
        data: os.data || '',
        cliente: os.cliente || '',
        telefone: os.telefone || '',
        veiculo: os.veiculo_modelo || (typeof os.veiculo === 'string' ? os.veiculo.replace(/\s*\(.*?\)/, '') : '') || '',
        placa: os.placa || '',
        cor: os.cor || '',
        ano: os.ano || '',
        km: os.km || '',
        funcionario_id: os.funcionario_id || '',
        forma_pagamento: os.forma_pagamento || '',
        pecas: os.pecas !== undefined ? os.pecas : 0,
        mao_obra: os.mao_obra !== undefined ? os.mao_obra : 0,
        desconto: os.desconto !== undefined ? os.desconto : 0,
        valor_pago: os.valor_pago !== undefined ? os.valor_pago : 0,
        custo: os.custo !== undefined ? os.custo : 0,
        servicos: Array.isArray(os.servicos) ? os.servicos.join('\n') : (typeof os.servicos === 'string' ? os.servicos : ''),
        fotos: fotosArray
      });
    }
  }, [os]);

  // Cálculos dinâmicos em tempo real
  const pecasNum = parseFloat(form.pecas) || 0;
  const maoObraNum = parseFloat(form.mao_obra) || 0;
  const descontoNum = parseFloat(form.desconto) || 0;
  const totalCalculado = Math.max(0, (pecasNum + maoObraNum) - descontoNum);
  const pagoNum = parseFloat(form.valor_pago) || 0;
  const saldoRestante = Math.max(0, totalCalculado - pagoNum);
  const custoNum = parseFloat(form.custo) || 0;
  const lucroEstimado = totalCalculado - custoNum;

  // Status de pagamento dinâmico
  const statusAtual = pagoNum >= totalCalculado && totalCalculado > 0
    ? 'pago'
    : (pagoNum > 0 ? 'parcial' : 'pendente');

  // Atalho de quitação rápida
  const handleLiquidarTotal = () => {
    setForm(prev => ({
      ...prev,
      valor_pago: totalCalculado.toFixed(2),
      forma_pagamento: prev.forma_pagamento && prev.forma_pagamento !== 'Outro / Pendente' ? prev.forma_pagamento : 'PIX'
    }));
    showToast('Valor pago preenchido com o saldo total!', 'sucesso');
  };

  const handleRemoverFoto = (index) => {
    setForm(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const payload = {
      numero: form.numero.trim(),
      data: form.data.trim(),
      cliente: form.cliente.trim(),
      telefone: form.telefone ? form.telefone.trim() : null,
      veiculo: form.veiculo.trim(),
      placa: form.placa ? form.placa.trim().toUpperCase() : null,
      cor: form.cor ? form.cor.trim() : null,
      ano: form.ano ? String(form.ano).trim() : null,
      km: form.km ? String(form.km).trim() : null,
      funcionario_id: form.funcionario_id ? parseInt(form.funcionario_id, 10) : null,
      forma_pagamento: form.forma_pagamento || null,
      pecas: pecasNum,
      mao_obra: maoObraNum,
      desconto: descontoNum,
      valor_pago: pagoNum,
      custo: custoNum,
      servicos: form.servicos.split('\n').map(s => s.trim()).filter(Boolean),
      fotos: form.fotos
    };

    try {
      const res = await api.put(`/api/ordens-servico/${os.id}`, payload);
      showToast('Ordem de serviço atualizada com sucesso!', 'sucesso');
      if (onSaved) {
        onSaved(res.data.ordem || { ...os, ...payload, id: os.id });
      }
      onClose();
    } catch (err) {
      showToast('Erro ao atualizar OS: ' + (err.response?.data?.detail || err.message), 'erro');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-[#121417] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl text-zinc-900 dark:text-white max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* 📌 Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#121417] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide uppercase flex items-center gap-2">
                Editar Nota / OS #{form.numero || os.numero_orcamento || os.id}
                {statusAtual === 'pago' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Pago
                  </span>
                )}
                {statusAtual === 'parcial' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Parcial
                  </span>
                )}
                {statusAtual === 'pendente' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    Em Aberto
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Edite dados do cliente, veículo, valores, pagamentos e serviços
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📜 Formulário com Rolagem Interna */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs">

          {/* 1. Dados Básicos da Ordem */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-500" /> Identificação da Ordem
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Nº Talão / Orçamento</label>
                <input
                  type="text"
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white font-bold outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Data da OS</label>
                <input
                  type="text"
                  value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-red-500" /> Mecânico Responsável
                </label>
                <select
                  value={form.funcionario_id}
                  onChange={e => setForm({ ...form, funcionario_id: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none cursor-pointer focus:border-red-500"
                >
                  <option value="">Selecione o mecânico...</option>
                  {funcionarios.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.nome} ({f.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Cliente e Veículo */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-red-500" /> Cliente & Veículo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Cliente</label>
                <input
                  type="text"
                  value={form.cliente}
                  onChange={e => setForm({ ...form, cliente: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white font-semibold outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Veículo (Modelo)</label>
                <input
                  type="text"
                  value={form.veiculo}
                  onChange={e => setForm({ ...form, veiculo: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white font-semibold outline-none focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Placa</label>
                <input
                  type="text"
                  value={form.placa}
                  onChange={e => setForm({ ...form, placa: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white uppercase font-mono outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Cor</label>
                <input
                  type="text"
                  placeholder="Ex: Prata"
                  value={form.cor}
                  onChange={e => setForm({ ...form, cor: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Ano</label>
                <input
                  type="text"
                  placeholder="Ex: 2018"
                  value={form.ano}
                  onChange={e => setForm({ ...form, ano: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white font-mono outline-none focus:border-red-500"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">KM Rodados</label>
                <input
                  type="number"
                  placeholder="Ex: 85000"
                  value={form.km}
                  onChange={e => setForm({ ...form, km: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white font-mono outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Valores Financeiros & Baixa de Pagamento */}
          <div className="bg-zinc-50 dark:bg-[#0b0c0e] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Financeiro, Recebimento & Baixa
              </h4>
              
              {/* Botão de Atalho de Quitação */}
              {saldoRestante > 0 && (
                <button
                  type="button"
                  onClick={handleLiquidarTotal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] transition shadow-xs flex items-center gap-1.5 active:scale-95"
                  title="Define o valor pago como o total e marca como quitado"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Quitar Saldo (R$ {saldoRestante.toFixed(2)})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Peças (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.pecas}
                  onChange={e => setForm({ ...form, pecas: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-zinc-600 dark:text-zinc-400 font-medium block mb-1">Mão de Obra (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.mao_obra}
                  onChange={e => setForm({ ...form, mao_obra: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-amber-600 dark:text-amber-400 font-bold block mb-1">Desconto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.desconto}
                  onChange={e => setForm({ ...form, desconto: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-amber-500/40 rounded-xl p-2.5 text-amber-600 dark:text-amber-400 font-bold outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-emerald-600 dark:text-emerald-400 font-black block mb-1">Total Líquido (R$)</label>
                <input
                  type="text"
                  disabled
                  value={`R$ ${totalCalculado.toFixed(2)}`}
                  className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-emerald-600 dark:text-emerald-400 font-black text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="text-zinc-700 dark:text-zinc-300 font-bold block mb-1">Forma de Pagamento</label>
                <select
                  value={form.forma_pagamento}
                  onChange={e => setForm({ ...form, forma_pagamento: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-900 dark:text-white font-medium outline-none cursor-pointer focus:border-red-500"
                >
                  <option value="">Selecione...</option>
                  {FORMAS_PAGAMENTO.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-700 dark:text-zinc-300 font-bold block mb-1">Valor Já Pago (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor_pago}
                  onChange={e => setForm({ ...form, valor_pago: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-900 border border-emerald-500/50 rounded-xl p-2.5 text-emerald-600 dark:text-emerald-400 font-black text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col justify-center bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold">Saldo Pendente</span>
                <span className={`text-base font-black ${saldoRestante > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  R$ {saldoRestante.toFixed(2)} {saldoRestante === 0 && '✓ Quitado'}
                </span>
              </div>
            </div>

            {/* Custo Interno & Lucro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="text-rose-600 dark:text-rose-400 font-bold block mb-1">
                  🔒 Custo Interno das Peças (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.custo}
                  onChange={e => setForm({ ...form, custo: e.target.value })}
                  placeholder="Gasto em autopeças"
                  className="w-full bg-white dark:bg-zinc-900 border border-rose-500/40 rounded-xl p-2.5 text-rose-600 dark:text-rose-400 font-bold outline-none focus:border-rose-500"
                />
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Não visível para o cliente na impressão</span>
              </div>

              <div className="flex flex-col justify-center bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-bold">Lucro Líquido Estimado</span>
                <span className={`text-base font-black ${lucroEstimado >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  R$ {lucroEstimado.toFixed(2)} {lucroEstimado >= 0 ? '📈' : '📉'}
                </span>
                <span className="text-[10px] text-zinc-400">Total (R$ {totalCalculado.toFixed(2)}) − Custo (R$ {custoNum.toFixed(2)})</span>
              </div>
            </div>
          </div>

          {/* 4. Serviços Realizados */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-red-500" /> Serviços & Peças Discriminados (um por linha)
            </h4>
            <textarea
              rows="4"
              value={form.servicos}
              onChange={e => setForm({ ...form, servicos: e.target.value })}
              placeholder="Ex: Troca de Óleo 5W30&#10;Filtro de Óleo&#10;Pastilhas de Freio Dianteiras"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white font-mono text-xs outline-none focus:border-red-500"
            />
          </div>

          {/* 5. Fotos Anexadas */}
          {form.fotos && form.fotos.length > 0 && (
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-red-500" /> Fotos Anexadas ({form.fotos.length})
              </h4>
              <div className="flex gap-2.5 overflow-x-auto p-2 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {form.fotos.map((url, idx) => (
                  <div key={idx} className="relative group shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700">
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoverFoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-90 hover:opacity-100 transition shadow"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </form>

        {/* 📌 Rodapé Fixo */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0b0c0e] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Total da OS: <strong className="text-zinc-900 dark:text-white text-xs">R$ {totalCalculado.toFixed(2)}</strong>
            {saldoRestante > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 ml-2 font-bold">(Resta R$ {saldoRestante.toFixed(2)})</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 ml-2 font-bold">(Quitado)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-bold transition text-xs active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={salvando}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
